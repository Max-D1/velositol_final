# Velositol.co — Health Blog Starter

Bộ website tĩnh không cần framework hoặc package bên ngoài. Website được tạo bằng Node.js có sẵn, xuất toàn bộ trang vào thư mục `dist/`, phù hợp để triển khai miễn phí hoặc chi phí thấp trên Vercel.

## 1. Website hiện có

- Trang chủ editorial health blog
- Trang `/topics`
- 4 trang topic:
  - `/topics/velositol-guides`
  - `/topics/protein-nutrition`
  - `/topics/supplement-literacy`
  - `/topics/research-explained`
- 6 bài blog mẫu
- Trang `/about`
- Trang `/editorial-policy`
- Trang `/medical-disclaimer`
- Tìm kiếm bài viết phía trình duyệt
- Responsive desktop, tablet và mobile
- Meta title, meta description, canonical URL
- Article structured data, Organization structured data
- `sitemap.xml` và `robots.txt`
- Social preview SVG và favicon

## 2. Ngôn ngữ được đề xuất

Bản đầu tiên nên dùng **English (US)** vì:

- Domain `velositol.co` phù hợp với thị trường quốc tế.
- Các truy vấn Velositol, protein nutrition và supplement literacy chủ yếu bằng tiếng Anh.
- Sản phẩm, nguồn nghiên cứu và quy định được nhắc đến chủ yếu thuộc thị trường Hoa Kỳ.
- Làm một ngôn ngữ tốt trước sẽ dễ kiểm soát health claims và editorial consistency hơn.

Khi website đã có khoảng 20–30 bài tiếng Anh, có thể thêm bản tiếng Việt trong thư mục `/vi/`. Không nên trộn hai ngôn ngữ trong cùng một URL.

## 3. Cảnh báo thương hiệu trước khi publish

`Velositol®` là thương hiệu đã đăng ký của Nutrition21, LLC. File:

```text
content/site.json
```

hiện đang đặt website là **independent educational publication** và hiển thị câu không liên kết/không được endorsement bởi Nutrition21.

Trước khi publish, cần xác nhận website thuộc trường hợp nào:

1. Website chính thức của chủ sở hữu thương hiệu.
2. Website của một brand được cấp phép sử dụng ingredient.
3. Website thông tin độc lập.

Sau đó chỉnh hai trường:

```json
"relationship": "independent",
"relationshipNote": "..."
```

Không nên xóa disclaimer thương hiệu nếu chưa có tài liệu xác nhận quyền sử dụng.

## 4. Chạy website trên máy tính

Cài Node.js 20 trở lên, sau đó mở Terminal trong thư mục dự án:

```bash
npm run dev
```

Mở:

```text
http://localhost:3000
```

Dừng server bằng `Ctrl + C`.

## 5. Build website

```bash
npm run build
```

Website hoàn chỉnh được xuất vào:

```text
dist/
```

Không chỉnh trực tiếp file trong `dist/`, vì thư mục này sẽ bị tạo lại sau mỗi lần build.

## 6. Sửa tên, domain, email và disclaimer

Mở:

```text
content/site.json
```

Các trường quan trọng:

- `name`: tên website
- `url`: domain chính thức
- `tagline`: tagline
- `description`: mô tả website
- `relationshipNote`: disclosure thương hiệu
- `email`: email editorial

Email `editor@velositol.co` hiện chỉ là placeholder. Cần tạo email thật hoặc thay bằng địa chỉ đang sử dụng.

## 7. Thêm hoặc sửa topic

Mở:

```text
content/topics.json
```

Mỗi topic có:

```json
{
  "slug": "protein-nutrition",
  "name": "Protein Nutrition",
  "eyebrow": "Food and routine",
  "description": "...",
  "icon": "P",
  "accent": "blue"
}
```

`accent` chỉ nên dùng một trong:

- `mint`
- `blue`
- `sand`
- `lavender`

## 8. Thêm bài blog

Mở:

```text
content/articles.json
```

Sao chép một article có sẵn và thay đổi:

- `slug`
- `title`
- `dek`
- `topic`
- `published`
- `modified`
- `readTime`
- `body`
- `sources`

Các loại block hiện hỗ trợ:

- `lead`
- `h2`
- `p`
- `ul`
- `callout`
- `comparison`

Sau khi sửa, chạy lại:

```bash
npm run build
```

## 9. Đưa code lên GitHub

1. Tạo tài khoản GitHub.
2. Tạo repository mới, ví dụ `velositol-co`.
3. Upload toàn bộ thư mục dự án, ngoại trừ `dist/` cũng được vì Vercel sẽ tự build.
4. Không đặt mật khẩu hoặc API key trong code.

Lệnh Git cơ bản:

```bash
git init
git add .
git commit -m "Initial Velositol.co website"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 10. Triển khai lên Vercel

1. Đăng nhập Vercel bằng GitHub.
2. Chọn **Add New → Project**.
3. Import repository `velositol-co`.
4. Vercel sẽ đọc `vercel.json`:
   - Build command: `node build.mjs`
   - Output directory: `dist`
5. Chọn **Deploy**.
6. Kiểm tra website bằng URL tạm của Vercel trước khi gắn domain.

## 11. Kết nối domain GoDaddy `velositol.co`

Trong Vercel:

1. Vào project.
2. Chọn **Settings → Domains**.
3. Thêm:
   - `velositol.co`
   - `www.velositol.co`
4. Vercel sẽ hiển thị DNS record chính xác cần dùng.

Trong GoDaddy:

1. Vào **My Products → Domains → velositol.co → DNS**.
2. Thêm hoặc sửa record theo đúng thông tin Vercel hiển thị.
3. Không xóa record MX nếu domain đang dùng email.
4. Chọn một domain làm primary, thường là `velositol.co`.
5. Redirect `www.velositol.co` về domain chính trong Vercel.

DNS có thể cần thời gian để cập nhật. SSL/HTTPS thường được Vercel cấp tự động sau khi domain xác minh thành công.

## 12. Việc nên làm trước khi website chính thức hoạt động

- Xác nhận quan hệ với trademark Velositol®.
- Thay email placeholder.
- Xác định pháp nhân sở hữu website.
- Thêm Privacy Policy và Cookie Notice theo công cụ analytics thực tế.
- Chỉ ghi “medically reviewed” khi có reviewer đủ điều kiện và đã review thật.
- Kiểm tra toàn bộ health claims và source của từng bài.
- Tạo Google Search Console và gửi `/sitemap.xml`.
- Thiết lập analytics sau khi có privacy/cookie disclosure phù hợp.
- Thay social preview SVG bằng ảnh 1200 × 630 px khi có bộ nhận diện chính thức.

## 13. Nâng cấp CMS sau này

Bản hiện tại ưu tiên tốc độ và không có chi phí database. Khi số bài tăng, có thể kết nối một headless CMS như Sanity, Contentful hoặc WordPress headless để đăng bài mà không sửa JSON.

Không nên thêm CMS ngay từ đầu nếu người quản trị chưa quen quy trình editorial. Nên hoàn thiện cấu trúc topic, policy và 10–20 bài đầu trước.
