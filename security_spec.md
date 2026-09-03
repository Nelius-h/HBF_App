# Hartbeesfontein Veiligheid - Production Security Specification & Threat Model

**Version:** 1.0 (Production-Hardened)  
**Jurisdiction:** Republic of South Africa (POPIA & Private Security Regulatory Authority PSIRA Compliance)  
**Security Model:** Deny-by-Default, Role-Based Access Control (RBAC), Granular Field-Level Segregation

---

## 1. System Roles & Access Matrix

The system strictly enforces three distinct roles:

| Role | Operational Scope | Sensitive Field Access | Intelligence & POI Access | Emergency Actions |
|---|---|---|---|---|
| **CLIENT** | Personal profile, personal panic trigger, community safety broadcast alerts, farm group broadcast. | Own gate codes & family only. | **NO ACCESS** (Cannot browse confidential intelligence records or suspects). | Trigger panic, confirm safe/false alarm, send live location & audio in active emergency. |
| **CONTROL_ROOM** | Active emergency dispatch, live audio/location monitoring, radio log, incident response, case creation, BOLO dispatch. | Full emergency snapshot access during active emergencies. | Read/Write operational intel, log observations, verify alerts. | Acknowledge panic, initiate emergency calls, dispatch reaction force, request live audio. |
| **MANAGEMENT** | Governance, executive reporting, backup/restore, user role provisioning, system health, POPIA audit & compliance. | Full system audit trail, DSAR export, encryption key management. | Full oversight, dispute resolution, record merging, intelligence archive. | Override lockdowns, trigger training drills, execute disaster recovery runbooks. |

---

## 2. The "Dirty Dozen" Threat & Security Invariants

1. **Deny-by-Default:** Any unauthenticated request or unmapped Firestore path is rejected immediately.
2. **Client Intelligence Isolation:** Normal `CLIENT` users cannot read from `/intel_pois`, `/intel_vois`, `/intel_observations`, or `/audit_logs`.
3. **Write-Once Audit Trail:** Audit log documents in `/audit_logs` cannot be updated or deleted by any user or administrator once created.
4. **Gate Code & Medical Privacy:** Gate codes, alarm passcodes, electric fence notes, and medical aid numbers are stored in encrypted sub-paths or restricted snapshots, readable only by the owning client or active responders during an emergency.
5. **POPIA Lawful Retention:** Deleting a user account does not delete lawfully retained criminal case records, SAPS case references, or forensic evidence logs.
6. **Live Stream Authorization:** Audio and high-priority GPS streaming sessions require mutual handshakes or verified emergency trigger state (`isEmergencyActive == true`).
7. **BOLO Scoping:** BOLOs with `distribution == 'internal_only'` are hidden from client feeds; only public broadcast BOLOs are accessible to `CLIENT` users.
8. **Training Isolation:** Records marked `isTraining: true` are filtered out of real executive reports and SLA response time calculations.
9. **Dispatch Fallback Guarantee:** When automated WhatsApp/Push delivery fails, client/operator emergency notifications fall back to local direct dial without blocking the main workflow.
10. **Tamper-Evident Backups:** All disaster recovery snapshots include SHA-256 integrity checksums and are verified before restoration.
11. **Lost Device Containment:** Management can immediately revoke active sessions and invalidate device tokens for lost responder hardware.
12. **AI Safeguard:** AI suggestions (such as crime trend summaries or OCR license plate suggestions) are tagged as `INFERENCE` and never execute state mutations without human operator confirmation.

---

## 3. Firestore Security Invariants

```text
/users/{uid}                    -> Read: Own UID or CONTROL_ROOM/MANAGEMENT; Write: Own profile (except role field), role updates by MANAGEMENT only.
/emergencies/{emergencyId}      -> Read: Participating client or CONTROL_ROOM/MANAGEMENT; Create: Auth users; Update: Responders/Client.
/cases/{caseId}                 -> Read: CONTROL_ROOM/MANAGEMENT (or Public flag for broadcast summary); Write: CONTROL_ROOM/MANAGEMENT.
/intel_pois/{poiId}             -> Read/Write: CONTROL_ROOM/MANAGEMENT ONLY.
/intel_vois/{voiId}             -> Read/Write: CONTROL_ROOM/MANAGEMENT ONLY.
/intel_observations/{obsId}     -> Read/Write: CONTROL_ROOM/MANAGEMENT ONLY.
/alerts/{alertId}               -> Read: Auth users; Write: CONTROL_ROOM/MANAGEMENT.
/audit_logs/{logId}             -> Create: Auth users; Read: MANAGEMENT only; Update/Delete: DENIED ALWAYS.
/backups/{backupId}             -> Read/Write: MANAGEMENT ONLY.
/system_health/{probeId}        -> Read/Write: CONTROL_ROOM/MANAGEMENT ONLY.
```
