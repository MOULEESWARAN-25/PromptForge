/**
 * Veyntra Accessibility Specification Engine
 *
 * Returns component-aware accessibility requirements AND their rationale,
 * so the generated prompt teaches users *why* something should exist,
 * not merely *what* to add.
 *
 * Dual-layer output per component:
 *   accessibilityRequirements — exact technical directives
 *   accessibilityRationale    — the human explanation behind each directive
 *
 * Compatible with both Node (backend) and browser (frontend fallback) — zero dependencies.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT ACCESSIBILITY MAP
// Each key is a canonical component name.
// Each value has: keywords (for detection), requirements[], rationale[]
// ─────────────────────────────────────────────────────────────────────────────
const COMPONENT_A11Y_MAP = {

  modal: {
    keywords: ['modal', 'dialog', 'popup', 'overlay', 'lightbox', 'drawer overlay'],
    requirements: [
      "Apply role='dialog' and aria-modal='true' to the modal container element",
      "Add aria-labelledby pointing to the modal's visible heading element",
      "Add aria-describedby pointing to the modal's body description if present",
      "Trap keyboard Tab and Shift+Tab focus within the open modal — focus must not reach background content",
      "Move focus to the first interactive element (or the modal heading) on open",
      "Restore focus to the trigger element that opened the modal on close",
      "Close the modal on Escape key press with an animated exit transition",
      "Provide a visible close button with aria-label='Close dialog'"
    ],
    rationale: [
      "Screen readers must announce the dialog boundary so users know they've entered a modal context",
      "Labelling the modal gives screen reader users an immediate understanding of its purpose",
      "Describing the modal body prevents users from having to navigate before understanding the content",
      "Focus trapping prevents keyboard users from accidentally interacting with background content while the dialog is open",
      "Moving focus on open ensures screen reader users start at the right context rather than being lost behind the overlay",
      "Restoring focus on close returns the user to their last position in the page — critical for keyboard-only users",
      "Escape is the universally understood dismissal shortcut that keyboard users rely on",
      "An accessible close button ensures the action is discoverable without a mouse"
    ]
  },

  commandPalette: {
    keywords: ['command palette', 'command launcher', 'cmd+k', 'cmdk', 'quick actions', 'spotlight', 'fuzzy search panel', 'search console', 'shortcuts menu'],
    requirements: [
      "Apply role='combobox' to the search input with aria-expanded reflecting open/closed state",
      "Apply role='listbox' to the results container and role='option' to each result item",
      "Use aria-activedescendant on the input to point to the currently highlighted option ID",
      "Auto-focus the search input immediately on palette mount — do not require a click",
      "Navigate results with ArrowUp / ArrowDown keys; wrap from last to first and first to last",
      "Activate the selected option on Enter key press",
      "Close the palette on Escape key press and restore focus to the trigger",
      "Announce result count changes to screen readers using aria-live='polite' on a status element",
      "Group results under role='group' with aria-label describing the group category"
    ],
    rationale: [
      "Combobox role communicates to assistive technology that the input controls a list of options",
      "Listbox and option roles allow screen readers to announce each result and the total count",
      "aria-activedescendant allows screen readers to track the highlighted option without moving DOM focus",
      "Auto-focusing the input removes a click barrier for keyboard users who triggered the palette via keyboard shortcut",
      "Arrow key navigation is the expected interaction pattern users rely on for list traversal",
      "Enter activation matches the standard selection behaviour keyboard users expect in any picker",
      "Escape provides a safe, predictable exit from the palette to restore the user's previous context",
      "Live region announcements ensure screen reader users know when results filter without seeing the screen",
      "Result grouping with labels helps screen reader users understand the category structure at a glance"
    ]
  },

  dropdown: {
    keywords: ['dropdown', 'select', 'listbox', 'menu', 'popover menu', 'context menu', 'action menu', 'option menu'],
    requirements: [
      "Apply role='button' and aria-haspopup='listbox' (or 'menu') to the trigger element",
      "Apply aria-expanded='true'/'false' on the trigger to reflect open state",
      "Apply role='listbox' to the options container; role='option' to each item",
      "Navigate options with ArrowUp / ArrowDown; Home jumps to first, End jumps to last",
      "Select an option with Enter or Space; close with Escape",
      "Close the dropdown when focus moves outside it (onBlur / focusout)",
      "Use aria-selected='true' on the currently selected option",
      "Ensure a visible focus indicator on the highlighted option at all times"
    ],
    rationale: [
      "aria-haspopup signals to screen readers that activating this control will open a list",
      "aria-expanded provides state feedback so screen reader users know whether the list is currently open",
      "Listbox and option semantics allow screen readers to announce each option and the total available",
      "Arrow key navigation is the expected standard for list traversal — mouse users have no equivalent constraint",
      "Enter/Space and Escape are the universal selection and dismissal keys in dropdown patterns",
      "Closing on blur prevents the dropdown from remaining open while the user's attention has moved on",
      "aria-selected communicates the current value to assistive technology without relying on visual styling",
      "A visible focus indicator is required for keyboard users to track their position in the list"
    ]
  },

  tabs: {
    keywords: ['tab', 'tab panel', 'tab navigator', 'tab switcher', 'tablist', 'settings tabs', 'navigation tabs'],
    requirements: [
      "Apply role='tablist' to the tab container element",
      "Apply role='tab' to each tab button and aria-selected='true'/'false' to reflect active state",
      "Apply role='tabpanel' to each panel; link it to its tab via aria-labelledby",
      "Navigate between tabs with ArrowLeft / ArrowRight (horizontal) or ArrowUp / ArrowDown (vertical)",
      "Activate a tab on Enter or Space; Tab key moves focus into the active panel (not to the next tab)",
      "Ensure tab panels are hidden with hidden attribute or display:none when not active — not just visually hidden",
      "Provide aria-controls on each tab pointing to its associated panel ID"
    ],
    rationale: [
      "tablist role groups the tab buttons so screen readers announce the set as a navigation region",
      "aria-selected communicates which tab is active without relying on visual-only cues like colour",
      "tabpanel with aria-labelledby ensures users know which tab's content they are reading",
      "Arrow key navigation is the ARIA design pattern for tabs — Tab is reserved for moving into panel content",
      "Enter/Space activates the focused tab; separating this from Tab prevents accidental activation",
      "Properly hidden panels prevent screen readers from reading inactive panel content during navigation",
      "aria-controls makes the tab–panel relationship machine-readable and queryable by assistive technology"
    ]
  },

  accordion: {
    keywords: ['accordion', 'collapsible', 'expand collapse', 'faq', 'details panel', 'disclosure'],
    requirements: [
      "Apply aria-expanded='true'/'false' to each accordion trigger button reflecting open/closed state",
      "Apply aria-controls on the trigger pointing to the panel ID it controls",
      "Apply role='region' and aria-labelledby on each panel pointing back to its trigger",
      "Toggle expand/collapse with Enter or Space; do not intercept Tab navigation",
      "Animate panel open/close using max-height or clip-path transitions respecting prefers-reduced-motion",
      "Ensure only the trigger is focusable when the panel is collapsed — not hidden panel content"
    ],
    rationale: [
      "aria-expanded state change is announced to screen readers so users know the panel opened without seeing it",
      "aria-controls creates the programmatic link between trigger and panel for assistive technology",
      "role='region' with a label marks each panel as a landmark, allowing quick navigation",
      "Enter/Space are the standard toggle keys — Tab must remain free for inter-element navigation",
      "Respecting prefers-reduced-motion prevents motion-triggered discomfort for users with vestibular disorders",
      "Hidden panel content must be unreachable by keyboard to prevent confusion about the number of focusable elements"
    ]
  },

  form: {
    keywords: ['form', 'input', 'sign up', 'sign in', 'login', 'register', 'contact form', 'checkout', 'wizard form', 'multi step form', 'validation'],
    requirements: [
      "Associate every input with a visible <label> element using for/id pairing — do not use placeholder as a label substitute",
      "Add aria-required='true' on required fields; mark them visually with an asterisk and a legend explaining the convention",
      "Add aria-invalid='true' and aria-describedby pointing to an error message element when validation fails",
      "Render error messages in a persistent visible element adjacent to the invalid field — do not rely on tooltips",
      "Add aria-live='assertive' on an error summary region to announce validation failures to screen readers",
      "Ensure Tab order follows visual reading order (top-left to bottom-right)",
      "On form submit failure, move focus to the error summary or first invalid field",
      "Support Enter key submission from text inputs"
    ],
    rationale: [
      "Placeholders disappear on input and are not reliably announced by all screen readers — labels are permanent",
      "aria-required communicates mandatory fields to assistive technology beyond colour or asterisk alone",
      "aria-invalid with aria-describedby associates the error message directly to the field that caused it",
      "Persistent visible errors allow users to review all issues simultaneously before re-submitting",
      "aria-live='assertive' immediately announces errors to screen reader users without requiring them to navigate to find the problem",
      "Logical Tab order prevents disorientation when keyboard users navigate a complex form",
      "Moving focus to errors on failed submission guides keyboard and screen reader users directly to the problem",
      "Enter-to-submit is the expected keyboard behaviour for search and single-line inputs"
    ]
  },

  navigation: {
    keywords: ['navigation', 'navbar', 'nav bar', 'sidebar nav', 'menu', 'header nav', 'breadcrumb', 'side menu', 'top nav'],
    requirements: [
      "Wrap the navigation in a <nav> element with a unique aria-label (e.g. aria-label='Main navigation')",
      "Add a 'Skip to main content' link as the very first focusable element on the page, visible on focus",
      "Apply aria-current='page' to the link matching the active route",
      "Ensure all nav links have descriptive text — avoid link text like 'Click here' or 'Read more'",
      "If navigation contains dropdowns or sub-menus, apply disclosure button patterns with aria-expanded",
      "Ensure keyboard Tab traversal through all nav links in visible order"
    ],
    rationale: [
      "<nav> with aria-label creates a named landmark, allowing screen reader users to jump directly to navigation",
      "Skip links allow keyboard and screen reader users to bypass the repeated navigation on every page load",
      "aria-current='page' communicates the user's location within the site to assistive technology",
      "Descriptive link text allows screen reader users browsing link lists to understand destinations out of context",
      "Dropdown sub-menus need disclosure patterns so screen reader users know activating a link will expand a menu",
      "Visible Tab traversal ensures keyboard users can reach all navigation destinations"
    ]
  },

  table: {
    keywords: ['table', 'data table', 'data grid', 'spreadsheet', 'results table', 'list table', 'leaderboard', 'comparison table'],
    requirements: [
      "Add a <caption> element describing the table's purpose — screen readers announce this first",
      "Use <th> with scope='col' for column headers and scope='row' for row headers",
      "Apply aria-sort='ascending'/'descending'/'none' on sortable column headers",
      "Ensure the table is scrollable horizontally on mobile while maintaining header associations",
      "If the table is interactive (selectable rows), add role='grid' and manage ArrowKey navigation between cells",
      "Provide a text description of data visualised in any charts alongside the table (role='img' with aria-label)"
    ],
    rationale: [
      "A caption gives screen reader users immediate context about what they are about to navigate",
      "scope attributes create explicit associations between data cells and their headers for screen readers",
      "aria-sort communicates sort state so users understand column ordering without reading the full data set",
      "Horizontal scrollability on mobile preserves data integrity — truncating table columns breaks header associations",
      "role='grid' with arrow key navigation allows screen reader users to traverse tabular data without losing their position",
      "Charts without textual alternatives are completely inaccessible to screen reader users"
    ]
  },

  sidebar: {
    keywords: ['sidebar', 'drawer', 'side panel', 'collapsible sidebar', 'off canvas', 'slide out'],
    requirements: [
      "When sidebar is a primary navigation region, use <nav> with aria-label",
      "When sidebar is a secondary panel (filters, details), use role='complementary' or <aside>",
      "If sidebar slides in/out, apply aria-hidden='true' when hidden so screen readers skip it",
      "Trap focus inside the sidebar when it is open as an overlay (mobile drawer mode)",
      "Close the sidebar on Escape key in overlay mode",
      "Apply aria-expanded on the toggle button controlling the sidebar"
    ],
    rationale: [
      "Named navigation landmarks allow screen reader users to jump directly to the sidebar without Tab traversal",
      "<aside> marks supplementary content that is related but secondary to the main content area",
      "aria-hidden on hidden sidebars prevents screen readers from announcing invisible elements",
      "Focus trapping in overlay mode prevents keyboard users from interacting with obscured background content",
      "Escape key dismissal is the expected exit pattern for overlay panels",
      "aria-expanded communicates the sidebar's current state to users who cannot see the visual change"
    ]
  },

  toast: {
    keywords: ['toast', 'notification', 'snackbar', 'alert banner', 'status message', 'flash message', 'announcement'],
    requirements: [
      "Apply role='status' and aria-live='polite' for non-critical notifications (success, info)",
      "Apply role='alert' and aria-live='assertive' for critical notifications (errors, warnings)",
      "Do not move keyboard focus to the toast — let users continue their current interaction",
      "Provide a manual dismiss button with aria-label on persistent toasts",
      "Ensure sufficient colour contrast on toast text (WCAG AA: 4.5:1 ratio minimum)",
      "Respect prefers-reduced-motion by removing slide/bounce animations when reduced motion is requested"
    ],
    rationale: [
      "aria-live='polite' queues the announcement after the current screen reader utterance — non-disruptive",
      "aria-live='assertive' interrupts immediately — appropriate only for errors that require urgent user attention",
      "Moving focus to a toast would disrupt the user's form or interaction flow unnecessarily",
      "A dismiss button is required for persistent toasts so keyboard users can clear them without a mouse",
      "Sufficient contrast ensures toast messages are readable by users with low vision",
      "Reduced-motion compliance prevents motion-triggered discomfort for vestibular disorder sufferers"
    ]
  },

  tooltip: {
    keywords: ['tooltip', 'hint', 'info bubble', 'popover hint', 'helper text bubble'],
    requirements: [
      "Apply role='tooltip' to the tooltip container element",
      "Reference the tooltip from its trigger via aria-describedby pointing to the tooltip's ID",
      "Show the tooltip on both hover AND keyboard focus — never hover-only",
      "Dismiss the tooltip on Escape key or when focus/hover leaves the trigger",
      "Do not put essential information only in a tooltip — tooltips are supplementary",
      "Ensure tooltip text has sufficient contrast against its background"
    ],
    rationale: [
      "role='tooltip' allows assistive technology to identify and announce the element as supplementary information",
      "aria-describedby associates the tooltip with its trigger so screen readers announce it automatically on focus",
      "Focus-triggered display ensures keyboard users receive the same hint that mouse users get on hover",
      "Escape dismissal allows users to remove an obscuring tooltip without moving their cursor or focus",
      "Essential information in tooltips-only is inaccessible to touch-only users who have no hover state",
      "Contrast requirements apply to tooltip text just as to body content"
    ]
  },

  combobox: {
    keywords: ['combobox', 'autocomplete', 'typeahead', 'search autocomplete', 'search with suggestions', 'autosuggest'],
    requirements: [
      "Apply role='combobox' to the text input with aria-autocomplete='list'",
      "Apply aria-expanded reflecting whether the suggestion list is visible",
      "Apply aria-controls pointing to the suggestion listbox element ID",
      "Apply aria-activedescendant on the input tracking the highlighted suggestion ID",
      "Navigate suggestions with ArrowUp / ArrowDown; commit selection with Enter",
      "Clear the input and close suggestions with Escape",
      "Announce suggestion count with aria-live='polite': 'X results available'",
      "Allow users to type freely without forcibly selecting a suggestion"
    ],
    rationale: [
      "aria-autocomplete='list' signals to screen readers that suggestions will appear as the user types",
      "aria-expanded state change is announced so users know suggestions appeared without seeing the screen",
      "aria-controls links the input and suggestion list so assistive technology can navigate between them",
      "aria-activedescendant tracks the highlighted item without moving DOM focus from the input",
      "Arrow key navigation is the standard pattern for suggestion list traversal",
      "Escape clears gives users a reliable way to abort the autocomplete and start fresh",
      "Live region announcements of suggestion counts orient screen reader users who cannot see the list",
      "Free text input is essential — forcing a suggestion selection breaks the experience for users with unusual input"
    ]
  },

  multiStepWorkflow: {
    keywords: ['multi step', 'wizard', 'onboarding', 'step form', 'checkout steps', 'stepper', 'progress steps'],
    requirements: [
      "Use aria-label='Step X of Y: Step Name' on each step indicator to communicate position",
      "Apply aria-current='step' on the active step indicator",
      "Move focus to the heading or first interactive element of each new step after navigation",
      "Announce step transitions to screen readers with aria-live='polite'",
      "Provide a persistent step count indicator (e.g. 'Step 2 of 4') in text, not only visually via icons",
      "Ensure Back and Next buttons have descriptive aria-labels (e.g. aria-label='Continue to Payment step')"
    ],
    rationale: [
      "Step position announcement prevents screen reader users from losing orientation within a multi-step flow",
      "aria-current='step' communicates progress state to assistive technology beyond visual progress bars",
      "Moving focus on step change ensures users are immediately aware of the new step without navigating to find it",
      "Live region step transition announcements prevent screen reader users from being confused after a step completes",
      "Text-based step count is readable by screen readers that may not correctly interpret SVG icon sequences",
      "Descriptive button labels give keyboard users confidence about the consequence of pressing Next"
    ]
  }

};

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD DETECTOR
// Identifies which component archetypes are relevant to the current request
// by scanning query text, componentName, components list, and pageType.
// ─────────────────────────────────────────────────────────────────────────────
function detectComponents({ mode, componentName, components = [], pageType, query }) {
  const searchText = [
    query,
    componentName,
    pageType,
    ...(Array.isArray(components) ? components : [])
  ].filter(Boolean).join(' ').toLowerCase();

  const detected = new Set();

  for (const [archetype, spec] of Object.entries(COMPONENT_A11Y_MAP)) {
    for (const keyword of spec.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        detected.add(archetype);
        break;
      }
    }
  }

  // Mode-based auto-inclusions
  if (mode === 'application') {
    detected.add('navigation');
    detected.add('form');
  }
  if (mode === 'page' && pageType) {
    const pt = pageType.toLowerCase();
    if (pt.includes('dashboard')) detected.add('table');
    if (pt.includes('landing') || pt.includes('marketing')) detected.add('navigation');
    if (pt.includes('settings') || pt.includes('account')) detected.add('tabs');
    if (pt.includes('auth') || pt.includes('login') || pt.includes('signup')) detected.add('form');
    if (pt.includes('checkout') || pt.includes('onboarding')) detected.add('multiStepWorkflow');
  }
  if (mode === 'component' && componentName) {
    // If no keywords matched, at least include form for component mode
    // (most components have interactive elements)
    if (detected.size === 0) detected.add('form');
  }

  return Array.from(detected);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// Returns a formatted multi-line string ready to inject into a system prompt.
// ─────────────────────────────────────────────────────────────────────────────
export function resolveAccessibilitySpecs({ mode, componentName, components, pageType, query }) {
  const detectedArchetypes = detectComponents({ mode, componentName, components, pageType, query });

  if (detectedArchetypes.length === 0) {
    // Universal baseline — applies when no specific component is detected
    return `ACCESSIBILITY REQUIREMENTS (Universal Baseline):
Requirements:
- All interactive elements must be reachable and operable by keyboard (Tab, Enter, Space, Escape)
- All images must have descriptive alt text; decorative images must have alt=""
- Ensure a minimum colour contrast ratio of 4.5:1 for body text (WCAG 2.1 AA)
- Do not rely on colour alone to convey information
- All form inputs must have associated visible labels

Rationale:
- Keyboard operability is required for users who cannot use a mouse (motor disabilities, power users)
- Alt text is the only way screen readers can convey image content to blind users
- Sufficient colour contrast ensures readability for users with low vision or colour blindness
- Colour-only information is invisible to users with colour blindness
- Labels associated with inputs prevent screen reader users from encountering unlabelled form fields`;
  }

  const lines = ['ACCESSIBILITY REQUIREMENTS (Component-Aware):'];
  lines.push('The following components were detected in this request. YOU MUST inject all requirements and rationale into the generated prompt so the developer understands both what to implement and why.');
  lines.push('');

  for (const archetype of detectedArchetypes) {
    const spec = COMPONENT_A11Y_MAP[archetype];
    const label = archetype.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    lines.push(`── ${label.trim()} ──`);
    lines.push('Requirements:');
    spec.requirements.forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r}`);
    });
    lines.push('Rationale (explain each to the developer in the generated prompt):');
    spec.rationale.forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
