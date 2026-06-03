import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'promptforge_default_secure_secret_key_2026';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Load disposable domains blocklist
let disposableDomains = [];
try {
  const blocklistPath = path.resolve(process.cwd(), 'src/config/disposableDomains.json');
  disposableDomains = JSON.parse(fs.readFileSync(blocklistPath, 'utf8'));
} catch (err) {
  console.warn('Failed to load disposable domains blocklist from disk', err);
}

// Initialize Supabase Admin client
const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// Firebase ID Token Verifier
async function verifyFirebaseIdToken(idToken, projectId) {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error('Token expired');
  if (payload.aud !== projectId) throw new Error('Invalid audience (project ID)');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Invalid issuer');

  // Fetch Google public certs
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', {
    next: { revalidate: 3600 } // Cache certs for 1 hour
  });
  const keys = await res.json();
  const cert = keys[header.kid];
  if (!cert) throw new Error('Public key not found for kid: ' + header.kid);

  // Verify signature
  const verify = crypto.createVerify('SHA256');
  verify.update(parts[0] + '.' + parts[1]);
  const isValid = verify.verify(cert, parts[2], 'base64');
  if (!isValid) throw new Error('Invalid signature');

  return payload;
}

// Local JWT Signer
function signSessionJwt(payload, secret, expiresInSeconds = 7 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const cleanPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };
  
  const base64UrlEncode = (str) => {
    return Buffer.from(typeof str === 'string' ? str : JSON.stringify(str))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const part1 = base64UrlEncode(header);
  const part2 = base64UrlEncode(cleanPayload);
  const signatureInput = `${part1}.${part2}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

// Local JWT Verifier
function verifySessionJwt(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const signatureInput = `${parts[0]}.${parts[1]}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (parts[2] !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const mockEmailParam = url.searchParams.get('mockEmail');

    if (process.env.NODE_ENV === 'development' && mockEmailParam) {
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('email', mockEmailParam)
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json({ success: true, user: data });
        }
      }
      return NextResponse.json({
        success: true,
        user: {
          uid: 'test-uid-verification-2026',
          email: mockEmailParam,
          name: mockEmailParam === 'mouleeswaran.cs23@bitsathy.ac.in' ? 'Moulee' : 'Verification Admin'
        }
      });
    }

    const sessionCookie = request.cookies.get('promptforge_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const payload = verifySessionJwt(sessionCookie, JWT_SECRET);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    let userProfile = { 
      uid: payload.uid, 
      email: payload.email, 
      name: payload.name,
      isDemo: payload.isDemo || false
    };

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('uid', payload.uid)
        .maybeSingle();

      if (!error && data) {
        userProfile = {
          ...data,
          isDemo: payload.isDemo || false
        };
      }
    }

    return NextResponse.json({ success: true, user: userProfile });
  } catch (err) {
    console.error('Session retrieval error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { idToken, name, role, primaryTool, isDemo } = await request.json();

    if (isDemo) {
      // 1. Enforce Server-Side Demo Limit Cookie
      const trackerCookie = request.cookies.get('promptforge_demo_tracker')?.value;
      let count = 0;
      if (trackerCookie) {
        const trackerPayload = verifySessionJwt(trackerCookie, JWT_SECRET);
        if (trackerPayload && typeof trackerPayload.count === 'number') {
          count = trackerPayload.count;
        }
      }

      if (count >= 3) {
        return NextResponse.json({
          error: 'Your demo access limit has been reached. Create an account to continue using PromptForge.'
        }, { status: 403 });
      }

      const newCount = count + 1;
      const demoUid = `demo_${crypto.randomUUID()}`;
      const demoEmail = `${demoUid}@promptforge.demo`;
      const demoName = `Demo User`;

      // 2. Synchronize user profile in database via Admin/Service role client
      if (supabaseAdmin) {
        const profilePayload = {
          uid: demoUid,
          email: demoEmail,
          name: demoName,
          role: 'Other',
          primary_tool: 'Other',
          last_active: new Date().toISOString()
        };

        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .upsert(profilePayload, { onConflict: 'uid' });

        if (profileError) {
          console.error('Failed to sync demo profile:', profileError);
        }

        const legacyUserPayload = {
          username: demoEmail,
          password: 'demo_session_password'
        };

        const { error: legacyError } = await supabaseAdmin
          .from('users')
          .upsert(legacyUserPayload, { onConflict: 'username' });

        if (legacyError) {
          console.error('Failed to sync legacy users constraint for demo:', legacyError);
        }
      }

      // 3. Generate secure local Session Cookie JWT and Tracker JWT
      const sessionPayload = {
        uid: demoUid,
        email: demoEmail,
        name: demoName,
        verified: true,
        isDemo: true
      };

      const sessionJwtToken = signSessionJwt(sessionPayload, JWT_SECRET, 1 * 24 * 3600); // 1 Day demo session
      const trackerJwtToken = signSessionJwt({ count: newCount }, JWT_SECRET, 365 * 24 * 3600); // 1 Year limit tracker

      const isProduction = process.env.NODE_ENV === 'production';
      const response = NextResponse.json({ success: true, user: sessionPayload, demoSessionsUsed: newCount });

      response.cookies.set('promptforge_session', sessionJwtToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 1 * 24 * 3600
      });

      response.cookies.set('promptforge_demo_tracker', trackerJwtToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 3600
      });

      return response;
    }

    if (!idToken) {
      return NextResponse.json({ error: 'ID Token is required' }, { status: 400 });
    }

    if (!PROJECT_ID) {
      return NextResponse.json({ error: 'Firebase Project ID is not configured on server' }, { status: 500 });
    }

    // 1. Verify Firebase ID Token
    let decodedUser;
    try {
      decodedUser = await verifyFirebaseIdToken(idToken, PROJECT_ID);
    } catch (authError) {
      return NextResponse.json({ error: `Auth token verification failed: ${authError.message}` }, { status: 401 });
    }

    // 2. Enforce Mandatory Email Verification
    if (!decodedUser.email_verified) {
      return NextResponse.json({ error: 'Email address must be verified to login.' }, { status: 403 });
    }

    // 3. Enforce Server-Side Disposable Email Domain Verification
    const email = decodedUser.email.toLowerCase();
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) {
      return NextResponse.json({ error: 'Registration using disposable email addresses is not permitted.' }, { status: 400 });
    }

    // 4. Synchronize user profile in database via Admin/Service role client (Idempotent UPSERT)
    if (supabaseAdmin) {
      const uid = decodedUser.sub;
      const userNameStr = name || decodedUser.name || email.split('@')[0];

      // Retrieve existing profile first to respect PostgreSQL NOT NULL constraints while preserving selections
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('role, primary_tool')
        .eq('uid', uid)
        .maybeSingle();

      const profilePayload = {
        uid: uid,
        email: email,
        name: userNameStr,
        role: role || (existingProfile ? existingProfile.role : 'Other'),
        primary_tool: primaryTool || (existingProfile ? existingProfile.primary_tool : 'Other'),
        last_active: new Date().toISOString()
      };

      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(profilePayload, { onConflict: 'uid' });

      if (profileError) {
        console.error('Failed to sync profile to user_profiles:', profileError);
      }

      // Upsert legacy user details for foreign key compatibility
      const legacyUserPayload = {
        username: email,
        password: 'firebase_verified_session'
      };

      const { error: legacyError } = await supabaseAdmin
        .from('users')
        .upsert(legacyUserPayload, { onConflict: 'username' });

      if (legacyError) {
        console.error('Failed to sync legacy users constraint:', legacyError);
      }
    }

    // 5. Generate secure local Session Cookie JWT
    const sessionPayload = {
      uid: decodedUser.sub,
      email: email,
      name: name || decodedUser.name || email.split('@')[0],
      verified: true
    };

    const sessionJwtToken = signSessionJwt(sessionPayload, JWT_SECRET);

    // 6. Set HTTP-Only Cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ success: true, user: sessionPayload });
    
    response.cookies.set('promptforge_session', sessionJwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600 // 7 Days session lifetime
    });

    return response;
  } catch (err) {
    console.error('Session establishment error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  const isProduction = process.env.NODE_ENV === 'production';
  const response = NextResponse.json({ success: true });
  
  // Clear Cookie
  response.cookies.set('promptforge_session', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0 // Expire instantly
  });

  return response;
}
