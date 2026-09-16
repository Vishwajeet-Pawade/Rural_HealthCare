IMPORTANT: MODIFY THE EXISTING HARI-CONNECT PROJECT. DO NOT REDESIGN, RESTRUCTURE, REMOVE, OR REPLACE ANY EXISTING FEATURES, SCREENS, COMPONENTS, NAVIGATION, DATA, STYLING, OR WORKFLOWS.

The current design already contains all existing Hari-Connect features. Keep EVERYTHING exactly as it is.

ONLY ADD the following Emergency Access / Emergency Patient Identification functionality to the existing system.

==================================================
NEW FEATURE: EMERGENCY MEDICAL RECORD ACCESS
==================================================

Problem:
A patient may be unconscious during a life-threatening emergency and therefore cannot provide consent or tell the doctor their Health ID.

Add a secure "Emergency Access" workflow for authorized doctors/PHC staff.

The emergency mechanism must NOT simply bypass security. It should be an audited "Break-Glass Emergency Access" system.

==================================================
1. EMERGENCY ACCESS ENTRY
==================================================

Add an "Emergency Access" option to the appropriate existing Doctor/PHC interface.

Do NOT make it the primary/default access method.

Use clear emergency visual hierarchy while maintaining the existing UI design system.

When clicked, show:

"Emergency Medical Access"

Message:
"Use this only when the patient is unable to provide consent and immediate medical attention is required."

Buttons/options:

[Scan Health ID QR]
[Search Patient]
[Create Temporary Emergency ID]

Also show:
"All emergency access is authenticated, time-limited and logged."

==================================================
2. PATIENT IDENTIFICATION
==================================================

Support THREE identification paths.

A. HEALTH ID QR

Doctor/health worker can scan the patient's Health ID QR card.

The QR contains ONLY a non-sensitive patient identifier.

After successful scan:
→ identify patient
→ display basic identity confirmation
→ continue to Emergency Access authorization.

Show:
Patient Name
Health ID
Age
Sex

Then:
[Confirm Patient]

IMPORTANT:
Do NOT expose medical records merely because the QR was scanned.

--------------------------------------------------

B. SEARCH PATIENT

Allow authorized staff to search using available information such as:

• Health ID
• Registered phone number
• Patient name + additional identifying information

Do not allow name-only matching to automatically open records.

After finding a possible match:
Show identity confirmation before accessing records.

[Confirm Patient]

--------------------------------------------------

C. UNKNOWN / UNIDENTIFIED PATIENT

If there is:

• No QR
• No phone
• No ID
• No relative/accompanying person
• No reliable identity information

Allow:

[Create Temporary Emergency ID]

Generate something like:

TEMP-ER-2026-XXXX

Show:

"Patient identity could not be established."

"Emergency treatment can continue using a temporary emergency record."

Allow doctor/health worker to record:
• Current vitals
• Symptoms
• Emergency observations
• Treatment/interventions
• Time of admission

Later, when identity is verified, provide:

[Link to Existing Health ID]

Do NOT automatically merge records without verification.

==================================================
3. DOCTOR AUTHENTICATION
==================================================

Before emergency record access, require the authorized doctor/PHC staff member to authenticate.

Display:

"Emergency Access Authorization"

Doctor:
[Authenticated Doctor Name]

Role:
[Doctor / PHC Staff]

Require:

• Secure login/session authentication
• Emergency reason

Emergency reason options:

• Patient unconscious
• Life-threatening condition
• Patient unable to provide consent
• Other emergency

Require a short reason/note.

Button:

[Request Emergency Access]

==================================================
4. BREAK-GLASS ACCESS
==================================================

After authorization, provide temporary Emergency Break-Glass Access.

Clearly display:

"EMERGENCY ACCESS ACTIVE"

"Patient consent could not be obtained because of an emergency."

"Access is limited to the minimum necessary medical information."

The emergency access should be:

• Time-limited
• Role-based
• Read-only by default
• Fully logged
• Restricted to critical information

==================================================
5. CRITICAL MEDICAL INFORMATION
==================================================

During emergency access, show a dedicated "Emergency Medical Summary" first.

Display:

• Blood Group
• Allergies
• Current Medications
• Major Medical Conditions
• Important Previous Medical History
• Recent Critical Test Results
• Recent Vitals
• Emergency Contacts

Do NOT automatically expose the entire longitudinal medical record.

Provide an optional:

[Request Additional Record Access]

if the doctor genuinely needs more information.

Keep existing consent-based access unchanged for normal/non-emergency use.

==================================================
6. EMERGENCY ACCESS TIMER
==================================================

Add a visible timer showing that Emergency Access is temporary.

Example:

EMERGENCY ACCESS
Time Remaining: 14:32

[End Emergency Access]

When the timer expires:
→ emergency record access automatically closes.

Do NOT change the patient's normal consent permissions.

==================================================
7. AUDIT LOG
==================================================

Every Emergency Break-Glass event must automatically create an audit record.

Record:

• Patient ID
• Doctor/staff ID
• Date
• Time
• Emergency reason
• Information accessed
• Access duration
• Device/facility
• Whether additional records were requested

Create an "Emergency Access Log" view in the existing appropriate admin/doctor interface.

Example:

EMERGENCY ACCESS LOG

Doctor: Dr. ______
Patient: ______
Reason: Patient unconscious
Started: 14:32
Ended: 14:47
Records accessed: Emergency Summary
Status: Completed

==================================================
8. PATIENT NOTIFICATION AFTER EMERGENCY
==================================================

After the emergency access ends, if the patient later becomes available, show a notification in their existing patient interface:

"Emergency access to your medical record was used."

Show:

Doctor/Staff:
Date & Time:
Reason:
Information accessed:

This must integrate with the existing access/consent history.

==================================================
9. IMPORTANT SECURITY RULES
==================================================

DO NOT remove or weaken the existing consent-based sharing system.

Normal workflow remains:

Patient Consent
→ Authorized Access
→ Record Access
→ Access Logged

Emergency workflow becomes:

Patient Unconscious
→ Identify Patient
→ Doctor Authentication
→ Emergency Reason
→ Break-Glass Authorization
→ Minimum Necessary Information
→ Time-Limited Access
→ Audit Log
→ Patient Notification

Emergency access is an EXCEPTION to prior consent, NOT an exception to authentication, authorization, auditing or security.

==================================================
10. UI/UX INTEGRATION
==================================================

CRITICAL:

Do NOT redesign the existing application.

Preserve:

• Existing color palette
• Existing typography
• Existing spacing
• Existing cards
• Existing buttons
• Existing navigation
• Existing icons
• Existing dashboard layout
• Existing patient/doctor workflows
• Existing AI features
• Existing offline functionality
• Existing consent functionality
• Existing Health ID functionality
• Existing SOS functionality

Reuse the existing components wherever possible.

Only create the additional screens, dialogs, cards, buttons and workflow required for Emergency Break-Glass Access.

The new screens must visually look like they were part of the original application from the beginning.

==================================================
11. EMERGENCY SOS INTEGRATION
==================================================

Integrate this with the EXISTING Emergency SOS functionality.

Do NOT replace the existing SOS feature.

The existing Emergency SOS remains responsible for sending an encrypted emergency alert containing patient ID, GPS location and vitals when connectivity is limited.

After the emergency alert reaches the doctor/PHC:

→ Doctor receives emergency alert
→ Doctor opens patient/emergency case
→ Patient identification is confirmed
→ Emergency Break-Glass Access can be initiated if required
→ Critical medical summary becomes available
→ Access is logged

Keep the existing SOS workflow unchanged except for adding this connection to the new Emergency Access workflow.

==================================================
12. DEMO SCENARIO
==================================================

Create the workflow so it can be demonstrated easily:

Scenario:

"Patient is unconscious and brought to PHC."

Doctor receives Emergency SOS.

Doctor opens Emergency Case.

System shows:

PATIENT IDENTIFICATION

[Scan QR]
[Search Patient]
[Temporary Emergency ID]

Doctor identifies patient.

Doctor selects:

"Patient unconscious"

System authenticates doctor.

System activates:

"EMERGENCY ACCESS ACTIVE"

Doctor sees:

Emergency Medical Summary

including:

Blood Group
Allergies
Medications
Major Conditions
Recent Vitals

Timer is visible.

All access is logged.

Doctor ends access.

System creates an Emergency Access Log.

Patient can later see the emergency access event in their access history.

==================================================
FINAL REQUIREMENT
==================================================

DO NOT MODIFY OR REMOVE ANY EXISTING FEATURE.

DO NOT CHANGE THE EXISTING DESIGN LANGUAGE.

DO NOT REPLACE THE EXISTING CONSENT SYSTEM.

DO NOT MAKE EMERGENCY ACCESS AUTOMATIC.

DO NOT SHOW THE COMPLETE MEDICAL RECORD BY DEFAULT.

ONLY EXTEND THE CURRENT HARI-CONNECT DESIGN WITH THIS SECURE, AUDITABLE, TIME-LIMITED EMERGENCY BREAK-GLASS WORKFLOW.