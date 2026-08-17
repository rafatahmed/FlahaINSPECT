> **Non-normative / post-MVP.** Exploratory GNSS notes only. Design of record: [`FlahaINSPECT - Technical Design (MVP).md`](./FlahaINSPECT%20-%20Technical%20Design%20(MVP).md). **KD-10: external GNSS is out of MVP.** Phone GPS + `accuracy_m` + pre-save pin adjust only. Do not implement NMEA, mock-location, or GNSS UI in PR-11/PR-13. Product name is **FlahaINSPECT**.

**External GNSS receivers are a strong optional upgrade for FlahaINSPECT (v1.1+).** Phone GPS typically delivers 3–10 m accuracy (sometimes better with dual-frequency chips and clear sky, worse under canopy, near buildings, or with multipath). For precise defect/plant location, repeatable site visits, boundary mapping, or irrigation asset tracking on farms and landscapes, external Bluetooth GNSS receivers can improve this to sub-meter or even 1–2 cm with RTK corrections.

Qatar’s open arid terrain generally provides excellent satellite visibility, making external GNSS particularly effective.

### Accuracy Tiers Relevant to Your App
| Source | Typical Horizontal Accuracy | Notes |
|--------|-----------------------------|-------|
| Smartphone GPS | 3–10 m | Built-in; degrades with obstruction |
| Consumer Bluetooth GNSS + SBAS | 1–3 m (sometimes better) | Free satellite-based augmentation |
| Mapping-grade GNSS | Sub-meter | Dual/multi-frequency |
| RTK (Real-Time Kinematic) with corrections | 1–2 cm | Requires base station or NTRIP network |

Record the accuracy estimate, fix type (standalone / SBAS / RTK Fixed / Float), HDOP/PDOP, and satellite count with every photo and point. This adds audit value to reports.

### How External Receivers Work with Mobile Apps
Most field-ready units output standard **NMEA-0183** sentences over Bluetooth (sometimes USB/OTG).

- **Android**: Use a mock-location provider app (e.g., Bluetooth GNSS, Lefebure NTRIP Client). Once set as the mock location source, *any* location-aware app (including yours) automatically receives the external position instead of the phone’s internal GPS.
- **iOS**: Prefer MFi-certified receivers for seamless Core Location integration. Non-MFi units often require specific companion apps or limited support.
- Direct NMEA parsing is also possible in your app (Bluetooth SPP or BLE) for fuller control and richer metadata.

Many receivers pair with a manufacturer companion app (Emlid Flow, Bad Elf app, Eos Tools Pro, Trimble Mobile Manager, etc.) that handles NTRIP corrections and then streams the corrected position outward.

### Recommended / Popular Receivers (2025–2026)
**Cost-effective / popular for field & agri use**
- **Emlid Reach RX / RX2 / RS series** — Highly regarded. Centimeter-level with RTK/NTRIP. Bluetooth, multi-constellation (GPS, GLONASS, Galileo, BeiDou, etc.). Emlid Flow app is excellent. Recent models include easier built-in correction options in covered regions. Strong NMEA streaming support. Good battery and ruggedness.
- **Bad Elf Flex / Flex Mini** — Solid Bluetooth performance on both iOS and Android. SBAS (~1.5 m) standard; Extreme config unlocks RTK. Compact and field-friendly.
- **ArduSimple / u-blox ZED-F9P based kits** — Affordable dual-frequency RTK boards/kits (often with antenna). USB + Bluetooth. Good for Android; iOS more limited. Popular DIY/professional hybrid.
- Compact options such as DataGNSS NANO Helix RTK or similar multi-band BLE units — Very small, centimeter RTK capability when corrected.

**More professional / mapping-grade**
- Eos Arrow series (Lite / 100 / Gold / Skadi)
- Trimble Catalyst DA2 or R-series
- Juniper Geode
- Leica Zeno / FLX100

Prices range from roughly $200–600 for capable dual-frequency kits up to $1,000–several thousand for fully integrated survey-grade units with long battery life, tilt compensation, and radios.

### Correction Sources (Critical for High Accuracy)
- **SBAS** (free where available) — Improves to ~0.5–2 m.
- **NTRIP / CORS networks** — Internet-delivered RTK corrections. Check availability and coverage in Qatar (local or regional providers, or international services). Requires cellular data on the phone or receiver.
- **Private base station + radio (UHF/LoRa)** — Independent of cellular; excellent for dedicated sites.
- **Subscription services** — Emlid Corrections (Point One network, expanding coverage), u-blox PointPerfect, Galileo HAS (PPP-style), etc.
- **PPK (Post-Processed Kinematic)** — Log raw data and process later; useful if real-time corrections are unavailable.

Open-sky farms in Qatar will achieve fast RTK fixes (often <10–30 seconds with multi-frequency receivers).

### Integration Recommendations for FlahaINSPECT
1. **Detection & preference** — Prefer external GNSS when available and when its reported accuracy is better than the phone’s. Fall back gracefully to internal GPS.
2. **Metadata capture** — Always store:
   - Source (phone / external model)
   - Accuracy (m)
   - Fix quality / solution type
   - Number of satellites / HDOP
   - Timestamp of the position used for the photo
3. **UI** — Live accuracy indicator, “External GNSS connected” badge, optional force-high-accuracy mode, and a warning if accuracy is poorer than a project threshold.
4. **NTRIP support** — Either integrate a basic NTRIP client or document that users configure corrections in the receiver’s companion app.
5. **Offline behavior** — External receivers still work without internet (standalone or with a local base). Only the correction stream needs connectivity.
6. **Mock location (Android)** vs direct parsing — Mock location is the simplest way to support the widest range of receivers with minimal code. Direct Bluetooth/NMEA gives richer control and works better for background or multi-app scenarios.
7. **Testing** — Validate with real devices under open sky, near trees/irrigation structures, and while walking. Confirm the app records the external accuracy correctly even when the phone itself has a poorer internal fix.

### Practical Advice for Flaha Users
- For routine landscape/plant inspections, modern dual-frequency phones + high-accuracy mode are often sufficient.
- Offer external GNSS as an optional professional accessory for high-value projects, legal documentation, precise asset mapping, or repeatable monitoring.
- Start by supporting the most common NMEA Bluetooth receivers via Android mock location + iOS MFi where possible. Document recommended models (Emlid Reach RX family and Bad Elf Flex are strong starting points).
- Consider bundling or partnering with a local supplier for Qatar-specific support, NTRIP access, and training.

### Limitations & Caveats
- RTK requires a correction source; without it you get dual-frequency standalone performance (typically sub-meter to ~1 m).
- iOS is stricter than Android regarding external location sources.
- Battery life, Bluetooth range, and multipath near metal structures or dense vegetation still matter.
- Cost and complexity rise with centimeter requirements — evaluate real project needs before mandating hardware.

**Bottom line**: External GNSS receivers are mature, practical, and well-supported for field inspection apps. Implementing optional support (detection + richer metadata + preference for better accuracy) will future-proof FlahaINSPECT and differentiate it for precision work without complicating the basic phone-only workflow.

If you want deeper details on a specific model (Emlid Reach, Bad Elf, ArduSimple, etc.), NTRIP setup in Qatar, sample Flutter/React Native code for NMEA or mock location, or a comparison table focused on cost vs accuracy for landscape use, let me know.