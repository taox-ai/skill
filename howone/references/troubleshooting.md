# Diagnose the failed layer

Read the actual response/status first. Use command help before an unfamiliar retry. Keep the current
App ID and job/Release identity; changing targets or returning a static result does not fix a failure.

| Symptom | Check | Recovery |
|---|---|---|
| Missing `howone.yaml` | CLI working directory, parent discovery, `--cwd` or `--config` | Point at the intended app; do not initialize a replacement app. `login`, `logout` and `whoami` are device-scoped and still work without a project |
| `No saved dev credential` from an App command | `howone whoami` in any directory | Run `howone login` for that environment, or set `HOWONE_TOKEN`; do not hand-edit `~/.config/howone/auth.json` |
| Missing/stale generated snapshot | Source path, App ID and artifact hash | Regenerate after the intended source change, then migrate/push through the supported path |
| Control-plane auth/connection failure | Selected dev profile, control URL and presence of the control token | Restore the actual service/authorized config; do not expose credentials or choose another app |
| `UC 登录服务暂时不可用` / session 503 | CLI-installed `.howone/auth.json`, platform UC connection and any explicitly configured local tunnel | Restore reachability; a network outage does not prove the UC account/token is invalid |
| UC returns 401 after session refresh | UC rejection of the actual credential | Use real sign-in; no local identity fallback |
| Valid UC login but app `users` record is delayed | Best-effort Mongo recording and database binding | Fix Mongo separately; UC still determines login success |
| AI authoring queued/running | Saved job ID with `ai status --job <id>` | Continue independent code work and poll; do not resubmit the same contract repeatedly |
| AI authoring failed/canceled/invalid_request | Real job error and declared contract | Fix the cause before a new submission; retain diagnostic IDs |
| AI execution is unavailable | Published sync, ready capability, server AI service binding and local dev credential | Sync/connect the intended Release; the CLI developer credential differs from the UC app session |
| Browser waiting canceled or server restarted | Upstream run state and app persistence | Do not claim upstream cancellation or durable completion without evidence |

Missing or mismatched authentication binding: rerun `howone auth init` for this App. Do not hand-edit
UC tenant IDs or add an app encryption secret. Authentication context belongs to the platform.

## Local development connections

The App may access private dev services through local Kubernetes port-forwards. Read its configured
target; `http://127.0.0.1:<port>` is only usable while the corresponding process/tunnel is listening.
Check that connection and service readiness before changing SDK login code. Use the operator's
actual kubeconfig, namespace, service and port; do not copy another app's test addresses by default.

A session request with no cookie may return anonymous without contacting UC. A successful anonymous
response therefore does not establish that real UC verification is reachable. Test the affected
authenticated path when possible, and distinguish an expected unauthenticated UC response from a
network error. Do not send OTPs or start billable AI runs merely to probe connectivity.

## Structured output

App `db/ai/auth` successes print JSON on stdout; `login/logout/whoami` print the same shape but read
only the device credential store. With `--json`, fatal errors print JSON
on stderr and exit nonzero. Help is text on stdout and exits zero, even with `--json`; `-h` is an alias.
Read stdout and stderr separately. The legacy Registry `run --stream` path emits SSE frames and then
its final result, so it is not a single JSON document even when `--json` is supplied.

`whoami` only inspects the saved credential's identity, issuing site and expiry. It does not verify
the token remotely or prove the app's current UC login. `login` is implemented but only saves the CLI
developer credential, so it cannot complete an App user's OAuth/OTP sign-in; `deploy` and `ai run`
remain placeholders — do not retry them as if an expired session were the cause.
