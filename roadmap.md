# Roadmap

## Painted mandala restoration (2026-10-21)
- [x] User selected the existing project painted source instead of the unavailable v3 filename
- [x] Replace procedural vector overlays with direct painted-image display and matched high-quality private export
- [x] Verified the original 1024px painting with brightness 1.2 / saturation 1.25 / specified gold aura; no SVG/Canvas in live artwork, fullscreen and 2048px PNG saving succeed, no page errors; 8 related tests pass and build OK

## Requested UI / mandala polish (2026-10-21) — done
- [x] Owner reading labels use あなた; Settings retains 本人; explicit self AI addressing instruction, family/group addressing retained
- [x] Shared TodayCard design; BGM immediately after monthlyLucky, evening immediately after helio; locked samples and guidance retained
- [x] Header order BGM → language → settings, confirmed at 320/390/1280px without overflow
- [x] Brighter exact seven-color pigment and neon aura, shared live/export; 2048-square private export preview rendered
- [x] 26 targeted regression tests pass, build OK; signed-in Today/Art/Consult labels checked without page errors. Fresh AI answer remains unverified: send attempt produced no response; no actual daily limits bypassed.

## Today notification and navigation consolidation (2026-10-21) — done
- [x] Standard+ nine-frequency BGM and seven-language plan guidance; VIP+ BGM reminder
- [x] Today-only switches/time controls; removed legacy morning and Settings individual controls/center
- [x] One header language control between Settings/BGM; five bottom tabs at 320/390/768/1280px, no horizontal overflow
- [x] Seven-language contextual VIP evening reset and lower-plan lock
- [x] Persistent reversible master pause retains enabled state and 22:15 saved time in signed-in UI; 210 tests pass, build OK
- [x] Standard nine enabled frequencies and playback across tabs beyond 20 seconds; Free one enabled sample frequency. Browser notification delivery permission was denied by the test environment, so pause/resume was verified with a local Notification mock; real OS delivery remains unverified and reminders remain open-app-only.

## Group consultation goal overflow (2026-10-21) — done
- [x] Send only the user goal (maximum 240 characters), keeping member data in the structured group field
- [x] Preserve server goal validation and structured group context; 10/100/101-member and 240/241-character regressions pass; 203 total tests pass, build OK
- [x] Signed-in live submission with 10 local preview members: goal 11 characters, HTTP 200, four-section AI answer read back in UI; real daily quota applied unchanged (paid roster persistence not part of this fix)

## Owner-excluded registration / BGM follow-up (2026-10-19) — done
- [x] Show the signed-in owner without creating a family row or consuming a slot
- [x] Exclude owner from group create/edit caps, retain default selection, apply authenticated database enforcement; actual paid writes unverified because this account has no membership
- [x] Shared audio context, single harmonic voices, filtered reverb, more headroom; all nine offline renders peak <0.36 and exact silent tails; live controls without page errors; physical listening unavailable
- [x] 194 tests pass; preview owner + 3 others fills exactly 3/3 slots; group saved and reopened with the same count; five-slot and 100-slot boundaries covered by tests

## BGM sound quality (2026-10-19) — done
- [x] Smooth start/stop/volume/tuning transitions and remove clipping sources
- [x] Refine all nine timbres and clean ambient reverb
- [x] All nine offline 48kHz renders: finite output, peak <0.44, silent post-fade tail; live tuning/mute/volume/stop without page errors; physical listening unavailable
- [x] Audio regression and unchanged 20-second sample lifecycle tests

## Fixed controls / Today depth (2026-10-19) — done
- [x] Fixed Home/Settings on every device and one adjacent BGM dropdown
- [x] Twelve-category plan guidance and all higher-tier advice
- [x] Five individual recipe dialogs in seven languages
- [x] Deeper contextual paid daily readings without changing calculations
- [x] 173 tests; signed-in BGM/tab persistence, guide, recipes and all tier counts; 1280/768/390/320px without overflow or page errors (physical sound quality unverified)

## Consultation UX and limits (2026-10-19) — done
- [x] Fixed readable samples with frosted continuation
- [x] Consultation limits 1/5/15/30/unlimited, reset notice, secure preview handling
- [x] Exclusive AI experience tabs and saved family/group compatibility selection
- [x] Group-name label and mobile/end-to-end checks (320/390px; signed-in exhausted quota; 157 tests)

## 相性診断 & 今日の占い 強化 (2026-10-16) — 完了
- [x] 相性診断: 4ブロック表示（総合スコア円形ゲージ/シナジー/摩擦/今日〜今週アクション）
- [x] 相性診断: team_members ワンタップ選択タブ + 手入力フォーム切替
- [x] 相性診断: 1080x1920 シェアカード生成・PNG保存（バースカラーパレット付き）
- [x] 相性診断: daily_usage 'compatibility' 上限時VIPモーダル
- [x] 今日の占い「2. 本日の星巡り」に季節3要素（🌱🧭✨）追加（計算ロジック不変）
- [x] 型チェック・143テスト・ビルドOK、ブラウザ実動作確認済み

## あなたの特性 再編 (2026-10-16) — 完了
- [x] ホーム/設定ボタン拡大、モバイル横スワイプでタブ移動
- [x] ①特性→②6視点→③15占術2段アコーディオン→④7バースカラー→⑤多層総合診断(1.5倍・行間狭め)→⑥シェア

## Goal / subject / groups (2026-10-18) — done
- Goal & subject card in Settings, subject-aware traits/today/consult, owner-only art notice
- Nicknames, group registration with plan caps (0/1/3/10/30), outlined lucky-color text

## Today guide / settings / compatibility / consultation update (2026-10-19) — done
- Today: helio renamed "地球暦から読み解く"; feng shui moved into card 4 as Standard+ collapsible with frosted sample for Free; sample dialogs frosted-glass masked.
- Settings: focus card renamed "目的・目標と診断対象設定" (7 languages) and collapsible.
- Compatibility: member picker is now a dropdown; picked members skip re-entry; manual form shows family/given-name space hint.
- Consultation: label renamed "相談する対象"; dropdown now offers owner / family / groups.

## Subject wording / group depth / notification center (2026-10-21) — done
- あなた→〇〇さん/〇〇グループ (Japanese), group member-by-member today readings, roles and synergy, daily subject message, clearer Family/Group tabs, Settings Notification Center with VIP+ BGM reminder.
- Open: non-Japanese wording swap and full 5-locale translation of new group-today copy (currently English fallback).

## Mandala center gem + seven-color crown (2026-10-21) — done
- MandalaCanvas renders the bundled painting on canvas and composes the overall-color faceted center gem plus the top seven birth-color stone row (localized labels); the same composition is used for the 2048px PNG export. Verified live, fullscreen and saved PNG on Standard preview plan; no page errors.
