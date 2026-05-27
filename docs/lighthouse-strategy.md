# Lighthouse Testing Strategy — ITing

Tài liệu định nghĩa **khi nào**, **chạy gì**, **so sánh thế nào** với Lighthouse để gắn vào NFR 3.3.1 (Performance) + 3.3.5 (Usability/A11y) + 3.3.7 (Compatibility).

---

## 1. Khi nào chạy Lighthouse?

| Trigger | Tần suất | Môi trường | Mục đích |
|---|---|---|---|
| **Local dev** | On-demand | localhost:3000 | Dev sửa UI → kiểm nhanh perf trước khi commit |
| **PR review** | Tự động (CI) | preview deploy | Block PR nếu score drop > 5pp |
| **Weekly schedule** | Thứ Hai 18:00 UTC | production URL | Theo dõi xu hướng dài hạn |
| **Pre-release** | Trước mỗi tag `v*` | production URL | Confirm không regression trước deploy |
| **Post-incident** | Khi cần | production URL | Đo lại sau khi fix perf bug |

Đã setup ở [.github/workflows/perf.yml](../.github/workflows/perf.yml) — `schedule: 0 18 * * 1` + `workflow_dispatch`.

---

## 2. Đo cái gì (Core Web Vitals + 4 category)

### 4 Category Score (0-100)

| Category | NFR target | Block PR threshold | Lý do |
|---|---|---|---|
| **Performance** | ≥ 70 | -5pp regression | NFR 3.3.1 |
| **Accessibility** | ≥ 80 | -3pp regression | NFR 3.3.5 — quan trọng nhất, dễ regress |
| **Best Practices** | ≥ 80 | -5pp | Security headers, HTTPS, console errors |
| **SEO** | ≥ 80 | -5pp | Crawlability, meta tags |

### Core Web Vitals (số liệu lab)

| Metric | Good | Needs improve | Poor | NFR target |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s | < 4s (PASS threshold của Google) |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8-3s | > 3s | < 2.5s |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 | < 0.15 |
| **TBT** (Total Blocking Time) | < 200ms | 200-600ms | > 600ms | < 300ms |
| **Speed Index** | < 3.4s | 3.4-5.8s | > 5.8s | < 4s |
| **TTI** (Time to Interactive) | < 3.8s | 3.8-7.3s | > 7.3s | < 5s |

Threshold đã encode trong [.lighthouserc.json](../.lighthouserc.json):
```json
{
  "categories:performance":   ["warn",  {"minScore": 0.70}],
  "categories:accessibility": ["error", {"minScore": 0.80}],
  "first-contentful-paint":   ["warn",  {"maxNumericValue": 2500}],
  "largest-contentful-paint": ["warn",  {"maxNumericValue": 4000}],
  "cumulative-layout-shift":  ["warn",  {"maxNumericValue": 0.15}]
}
```

---

## 3. Pages cần audit (representative sample)

Test 5 page điển hình thay vì toàn bộ:

| Page | URL | Lý do |
|---|---|---|
| **Homepage** | `/` | Landing chính — first impression, SEO target |
| **Job list** | `/jobs` | Heavy data + filter UI |
| **Job detail** | `/jobs/{slug}` | Long content, SEO critical |
| **Login** | `/login` | Auth flow, form usability |
| **Candidate dashboard** | `/candidate/dashboard` | Authenticated, recharts heavy |

Cập nhật `.lighthouserc.json`:
```json
"collect": {
  "url": [
    "https://datnhk252iting.dpdns.org/",
    "https://datnhk252iting.dpdns.org/jobs",
    "https://datnhk252iting.dpdns.org/about",
    "https://datnhk252iting.dpdns.org/companies",
    "https://datnhk252iting.dpdns.org/login"
  ],
  "numberOfRuns": 3
}
```

> Chạy 3 lần mỗi URL → lấy median để smooth variance. Single-run dễ noise ±10pp.

---

## 4. Mobile vs Desktop

Lighthouse có 2 preset:

| Preset | Throttling | Use case |
|---|---|---|
| `mobile` (default) | 4G slow + 4× CPU slowdown | Trải nghiệm thực tế của user VN — phần lớn vào bằng mobile |
| `desktop` | Cable 10Mbps + no CPU slowdown | Power user, đo upper-bound |

**Khuyến nghị ITing**: chạy **mobile** làm gating (NFR target), **desktop** chỉ để debug.

Đã set trong `.lighthouserc.json`:
```json
"settings": {
  "preset": "desktop",  // ← đổi sang "" hoặc bỏ để dùng mobile mặc định
  "throttlingMethod": "simulate"
}
```

> ⚠️ Hiện đang set `desktop` để score cao hơn. Production-ready nên đổi về **mobile** (chỉ rev lại `.lighthouserc.json`).

---

## 5. Lab vs Field data

| | **Lab** (Lighthouse) | **Field** (CrUX / Real User Monitoring) |
|---|---|---|
| Source | Local browser simulate | Real user, từ Chrome UX Report |
| Variance | Cao (±10pp) | Thấp (aggregate) |
| Speed | Vài giây | Cập nhật 28 ngày |
| Best for | Regression detection, PR gating | Production health metric |
| Setup ITing | ✅ Có (CI) | ❌ Cần Web Vitals JS lib + analytics endpoint |

**Lab data đủ cho luận văn**. Nếu muốn field data, thêm thư viện `web-vitals` vào frontend + endpoint backend lưu metric.

---

## 6. CI integration — assert + block PR

Hiện đã có [.github/workflows/perf.yml](../.github/workflows/perf.yml). Nâng cấp để block PR khi regression:

```yaml
- name: Run Lighthouse CI assert
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      ${{ inputs.target_url || 'https://datnhk252iting.dpdns.org' }}
    runs: 3
    uploadArtifacts: true
    temporaryPublicStorage: true
    configPath: ./.lighthouserc.json
  # NẾU assert fail (theo threshold .lighthouserc.json) → job fail → block merge
```

Treosh action tự fail nếu `assert` có level `"error"` không pass.

---

## 7. So sánh kết quả qua các lần chạy

Lighthouse CI server (`lhci server`) lưu history + diff. 2 option:

| Option | Setup | Lưu trữ |
|---|---|---|
| **Public temporary storage** | `uploadArtifacts: true, temporaryPublicStorage: true` | URL share ngắn hạn (~7 ngày) |
| **Self-hosted LHCI server** | Run `lhci server` trên 1 container + Postgres | Vô thời hạn, dashboard chuyên |

**Khuyến nghị ITing**: dùng **public temporary storage** (đã set). Mỗi run sẽ in URL `https://storage.googleapis.com/...` để click xem.

---

## 8. Performance Budget — hard limits

Thêm budget assertions vào `.lighthouserc.json`:

```json
"assert": {
  "assertions": {
    "resource-summary:script:size":     ["error", {"maxNumericValue": 300000}],
    "resource-summary:image:size":      ["warn",  {"maxNumericValue": 500000}],
    "resource-summary:total:size":      ["warn",  {"maxNumericValue": 1500000}],
    "resource-summary:third-party:count": ["warn", {"maxNumericValue": 10}],
    "unused-css-rules":                 "off",
    "unused-javascript":                "off"
  }
}
```

Threshold tương ứng:
- JS bundle ≤ 300 KB (sau gzip — hiện 35 KB, dư địa lớn)
- Images ≤ 500 KB / page
- Total page weight ≤ 1.5 MB
- Third-party requests ≤ 10

---

## 9. Workflow cho dev khi sửa UI

```bash
# 1. Build production local
cd ITing-frontend
npm run build -- --env APP_ENV=production

# 2. Serve dist
npx serve -p 3000 dist

# 3. Run Lighthouse trên local production build
cd ..
lighthouse http://localhost:3000 \
  --output html --output json \
  --output-path ./lh-local.html \
  --chrome-flags="--headless=new --no-sandbox"

# 4. Mở report
start lh-local.html
```

> ⚠️ **Đừng audit `npm start` dev server** — chứa React DevTools, source maps, dev warnings → score sai lệch ~-30pp.

---

## 10. Audit thường bị fail (ITing-specific TODO)

Theo Lighthouse production lần đo gần nhất (Performance 61, LCP 9.8s):

| Audit | Trạng thái | Action |
|---|---|---|
| **largest-contentful-paint** | 🔴 9.8s | ✅ Đã fix v1.0.124: banner 3.5MB → 189KB |
| **first-contentful-paint** | 🟡 3.3s | ✅ Đã fix: preconnect + brotli + preload |
| **unused-javascript** | 🟡 | Lazy route đã có. Còn thừa từ Quill/Charts — đã `splitChunks` |
| **render-blocking-resources** | 🟡 | Font Google → đã `print → onload` swap |
| **uses-text-compression** | 🟢 | ✅ `gzip_static` + Brotli (webpack pre-gen) |
| **uses-responsive-images** | 🟡 | Banner đã có `width/height`. Other images chưa. TODO: `<picture>` cho hero |
| **uses-rel-preconnect** | 🟢 | ✅ Done — API + S3 + fonts |
| **image-aspect-ratio** | 🟢 | ✅ Width/height set |
| **color-contrast** | 🟡 | Vài chỗ contrast < 4.5:1 — TODO sweep CSS palette |
| **button-name / link-name** | 🟢 | ✅ Đã thêm aria-label cho icon-only buttons (banner nav, bookmark) |
| **html-has-lang** | 🟢 | ✅ `<html lang="vi">` |
| **meta-description** | 🟢 | ✅ Set trong index.html |

---

## 11. Roadmap đạt Lighthouse 90+ Performance

| Quarter | Action | Expected boost |
|---|---|---|
| ✅ Q2 2026 | Brotli + preload + AVIF banner (v1.0.124) | 61 → ~80 |
| Q3 2026 | Optimize JobCard images (responsive `srcset` + AVIF) | +3-5 |
| Q3 2026 | Code-split Quill (chỉ load khi `/admin/blog/edit`) | +2-3 |
| Q3 2026 | Server-Timing header backend → debug TTFB | +2-3 |
| Q4 2026 | SSR/SSG cho homepage (Next.js migration, optional) | +5-10 |

Target cuối: **Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95**.

---

## 12. Lệnh quick reference

```bash
# Cài 1 lần
npm install -g lighthouse @lhci/cli

# Run đơn lẻ — production
lighthouse https://datnhk252iting.dpdns.org \
  --output html --output-path ./lh-prod.html \
  --chrome-flags="--headless=new --no-sandbox"

# Run LHCI với config + assert
lhci autorun --config=./.lighthouserc.json

# Run weekly schedule local (giả lập CI)
lhci collect --url=https://datnhk252iting.dpdns.org --numberOfRuns=3
lhci upload --target=temporary-public-storage

# Chỉ chạy category cụ thể (debug)
lighthouse https://... --only-categories=performance,accessibility

# Mobile preset (slow 4G + 4x CPU)
lighthouse https://... --preset=mobile

# Desktop preset
lighthouse https://... --preset=desktop
```

---

## 13. Trigger CI workflow

```bash
# Manual dispatch qua GitHub UI: Actions → "Performance & A11y" → Run workflow
# Hoặc qua gh CLI:
gh workflow run perf.yml -f target_url=https://datnhk252iting.dpdns.org -f vus=50

# Xem kết quả gần nhất:
gh run list --workflow=perf.yml --limit 5
gh run view <run-id> --log
```

---

## Liên kết

- [.lighthouserc.json](../.lighthouserc.json) — config thresholds
- [.github/workflows/perf.yml](../.github/workflows/perf.yml) — CI workflow
- [tests/perf/k6-smoke.js](../tests/perf/k6-smoke.js) — k6 perf test (đo throughput + p95)
- [UML/Payment/](../UML/Payment/) — Sequence/Activity của payment (ngữ cảnh perf)
