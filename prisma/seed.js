// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
    await prisma.image.deleteMany({});
    await prisma.product.deleteMany({});
    const booksData = [{
            name: "Lập Trình Python Cơ Bản",
            author: "Nguyễn Văn A",
            publisher: "NXB Giáo Dục",
            isbn: "9786041234567",
            language: "Tiếng Việt",
            publishedYear: 2021,
            pages: 320,
            description: "Cuốn sách “Lập Trình Python Cơ Bản” là hướng dẫn hoàn chỉnh dành cho những ai muốn bắt đầu học lập trình với Python – một trong những ngôn ngữ lập trình phổ biến và dễ tiếp cận nhất hiện nay.  Thông qua những ví dụ thực tiễn và các bài tập tự luyện, bạn đọc sẽ được:  Hiểu rõ cú pháp cơ bản của Python, từ biến, kiểu dữ liệu, đến cấu trúc điều kiện và vòng lặp.  Làm quen với hàm, module, và các thư viện tiêu chuẩn của Python.  Phát triển tư duy lập trình logic, giải quyết vấn đề và xây dựng các chương trình nhỏ.  Chuẩn bị nền tảng để học tiếp các chủ đề nâng cao như lập trình hướng đối tượng, phát triển web, hoặc xử lý dữ liệu.  Được viết với phong cách dễ hiểu, minh họa sinh động và bài tập thực hành, cuốn sách là người bạn đồng hành lý tưởng cho học sinh, sinh viên, lập trình viên mới, hoặc bất kỳ ai muốn khám phá thế giới lập trình Python.  Điểm nổi bật:  Hướng dẫn từng bước, dễ theo dõi.  Nhiều ví dụ thực tế, áp dụng ngay.  Bài tập luyện tập sau mỗi chương, giúp củng cố kiến thức.",
            category: "Công nghệ",
            price: 120000,
            quantity: 50,
            images: ["/images/books/1a.jpg", "/images/books/1b.jpg", "/images/books/1c.jpg", "/images/books/1d.jpg", "/images/books/1e.jpg"]
        },
        {
            name: "Clean Code",
            author: "Robert C. Martin",
            publisher: "Prentice Hall",
            isbn: "9780132350884",
            language: "English",
            publishedYear: 2008,
            pages: 464,
            description: "“Clean Code” là cuốn sách kinh điển về lập trình, giúp lập trình viên viết mã nguồn rõ ràng, dễ hiểu và dễ bảo trì. Cuốn sách trình bày các nguyên tắc, kỹ thuật và best practice để viết code “sạch”, từ cách đặt tên biến, viết hàm, cho tới thiết kế lớp và module. Thông qua các ví dụ minh họa thực tế, bạn đọc sẽ học cách phát hiện và sửa các đoạn code xấu, từ đó nâng cao chất lượng dự án phần mềm. Đây là tài liệu không thể thiếu cho những ai muốn trở thành lập trình viên chuyên nghiệp.",
            category: "Công nghệ",
            price: 450000,
            quantity: 30,
            images: ["/images/books/2a.jpg", "/images/books/2b.jpg", "/images/books/2c.jpg", "/images/books/2d.jpg", "/images/books/2e.jpg"]
        },
        {
            name: "Dế Mèn Phiêu Lưu Ký",
            author: "Tô Hoài",
            publisher: "NXB Kim Đồng",
            isbn: "9786042081234",
            language: "Tiếng Việt",
            publishedYear: 1941,
            pages: 180,
            description: "“Dế Mèn Phiêu Lưu Ký” là tác phẩm kinh điển của nhà văn Tô Hoài, kể về những chuyến phiêu lưu của Dế Mèn – từ lúc bướng bỉnh, thiếu kinh nghiệm đến khi trưởng thành và học được bài học về lòng dũng cảm, tình bạn và trách nhiệm. Cuốn sách kết hợp yếu tố giải trí, giáo dục và những triết lý nhân sinh sâu sắc, phù hợp với cả thiếu nhi và độc giả mọi lứa tuổi.",
            category: "Văn học",
            price: 85000,
            quantity: 100,
            images: ["/images/books/3a.jpg", "/images/books/3b.jpg", "/images/books/3c.jpg", "/images/books/3d.jpg", "/images/books/3e.jpg"]
        },
        {
            name: "Harry Potter và Hòn Đá Phù Thủy",
            author: "J. K. Rowling",
            publisher: "Bloomsbury",
            isbn: "9780747532699",
            language: "English",
            publishedYear: 1997,
            pages: 223,
            description: "“Harry Potter và Hòn Đá Phù Thủy” là cuốn sách mở đầu trong loạt truyện Harry Potter của J.K. Rowling, kể về cậu bé Harry phát hiện mình là phù thủy và bắt đầu hành trình học tập tại trường Hogwarts. Câu chuyện đầy phép thuật, tình bạn, lòng dũng cảm và những bí ẩn ly kỳ, đưa người đọc vào một thế giới kỳ ảo mà hấp dẫn cho cả trẻ em lẫn người lớn.  Nếu muốn, tôi có thể viết luôn phiên bản rút gọn để insert vào database, giống như các cuốn sách trước. Bạn có muốn tôi làm không?  ChatGPT có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.",
            category: "Fantasy",
            price: 200000,
            quantity: 80,
            images: ["/images/books/4a.jpg", "/images/books/4b.jpg", "/images/books/4c.jpg", "/images/books/4d.jpg", "/images/books/4e.jpg"]
        },
        {
            name: "Tuổi Thơ Dữ Dội",
            author: "Phùng Quán",
            publisher: "NXB Kim Đồng",
            isbn: "9786042112345",
            language: "Tiếng Việt",
            publishedYear: 1988,
            pages: 400,
            description: "“Tuổi Thơ Dữ Dội” của Phùng Quán là tập truyện kể về những năm tháng tuổi thơ đầy khốc liệt, dũng cảm và xúc động trong bối cảnh chiến tranh. Qua các câu chuyện về tình bạn, lòng trung thực và ý chí kiên cường của trẻ em, cuốn sách phản ánh sức sống mãnh liệt và tinh thần bất khuất của tuổi trẻ Việt Nam. Đây là tác phẩm giàu giá trị nhân văn và lịch sử, phù hợp cho độc giả mọi lứa tuổi.  Tôi có thể viết luôn phiên bản rút gọn để insert vào database, như các cuốn sách trước, nếu bạn muốn.  ChatGPT có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.",
            category: "Văn học",
            price: 100000,
            quantity: 60,
            images: ["/images/books/5a.jpg", "/images/books/5b.jpg", "/images/books/5c.jpg", "/images/books/5d.jpg", "/images/books/5e.jpg"]
        },
        {
            name: "Think and Grow Rich",
            author: "Napoleon Hill",
            publisher: "The Ralston Society",
            isbn: "9780449214923",
            language: "English",
            publishedYear: 1937,
            pages: 238,
            description: "“Think and Grow Rich” của Napoleon Hill là cuốn sách kinh điển về phát triển tư duy, thành công và làm giàu. Cuốn sách chia sẻ những nguyên tắc, chiến lược và câu chuyện thực tế về các doanh nhân thành đạt, giúp người đọc hình thành tư duy tích cực, xác định mục tiêu rõ ràng và biến ý tưởng thành kết quả thực tế. Đây là tài liệu giá trị cho bất kỳ ai muốn phát triển sự nghiệp, tài chính và cuộc sống cá nhân.",
            category: "Kinh tế",
            price: 180000,
            quantity: 70,
            images: ["/images/books/6a.jpg", "/images/books/6b.jpg", "/images/books/6c.jpg", "/images/books/6d.jpg", "/images/books/6e.jpg"]
        },
        {
            name: "Đắc Nhân Tâm",
            author: "Dale Carnegie",
            publisher: "NXB Trẻ",
            isbn: "9786041237890",
            language: "Tiếng Việt",
            publishedYear: 1936,
            pages: 320,
            description: "“Đắc Nhân Tâm” của Dale Carnegie là cuốn sách kinh điển về nghệ thuật giao tiếp, xây dựng mối quan hệ và ảnh hưởng đến người khác. Cuốn sách cung cấp những nguyên tắc thực tiễn để tạo thiện cảm, thuyết phục và hòa hợp trong quan hệ cá nhân lẫn công việc. Qua các ví dụ minh họa sinh động, độc giả sẽ học được cách ứng xử khôn ngoan, phát triển kỹ năng xã hội và thành công trong cuộc sống.",
            category: "Kỹ năng sống",
            price: 120000,
            quantity: 90,
            images: ["/images/books/7a.jpg", "/images/books/7b.jpg", "/images/books/7c.jpg", "/images/books/7d.jpg", "/images/books/7e.jpg"]
        },
        {
            name: "Sapiens: Lược Sử Loài Người",
            author: "Yuval Noah Harari",
            publisher: "NXB Thế Giới",
            isbn: "9780062316097",
            language: "English",
            publishedYear: 2011,
            pages: 443,
            description: "“Sapiens: Lược Sử Loài Người” của Yuval Noah Harari là cuốn sách tổng quan về lịch sử loài người, từ thời nguyên thủy đến hiện đại. Cuốn sách khám phá cách Homo sapiens phát triển, hình thành xã hội, văn hóa, kinh tế và khoa học, đồng thời phân tích những yếu tố đã định hình thế giới hiện nay. Đây là tác phẩm kết hợp kiến thức lịch sử, khoa học và triết lý, phù hợp cho độc giả muốn hiểu sâu về sự tiến hóa và vị trí của con người trong lịch sử.",
            category: "Lịch sử",
            price: 280000,
            quantity: 40,
            images: ["/images/books/8a.jpg", "/images/books/8b.jpg", "/images/books/8c.jpg", "/images/books/8d.jpg", "/images/books/8e.jpg"]
        },
        {
            name: "Chí Phèo",
            author: "Nam Cao",
            publisher: "NXB Văn Học",
            isbn: "9786042345678",
            language: "Tiếng Việt",
            publishedYear: 1941,
            pages: 120,
            description: "“Chí Phèo” của Nam Cao là tác phẩm văn học kinh điển phản ánh hiện thực xã hội làng quê Việt Nam trước Cách mạng Tháng Tám. Qua câu chuyện về cuộc đời bi kịch của Chí Phèo – từ một nông dân lương thiện trở thành kẻ lừa đảo, côn đồ – tác giả phơi bày những áp bức, bất công và sự tha hóa của con người trong xã hội phong kiến. Đây là tác phẩm giàu giá trị nhân văn, giúp độc giả suy ngẫm về số phận, nhân phẩm và lòng nhân đạo.",
            category: "Văn học",
            price: 60000,
            quantity: 120,
            images: ["/images/books/9a.jpg", "/images/books/9b.jpg", "/images/books/9c.jpg", "/images/books/9d.jpg", "/images/books/9e.jpg"]
        },
        {
            name: "The Pragmatic Programmer",
            author: "Andrew Hunt & David Thomas",
            publisher: "Addison-Wesley",
            isbn: "9780201616224",
            language: "English",
            publishedYear: 1999,
            pages: 352,
            description: "“The Pragmatic Programmer” của Andrew Hunt và David Thomas là cuốn sách hướng dẫn lập trình viên trở nên chuyên nghiệp và hiệu quả hơn. Cuốn sách chia sẻ các nguyên tắc, chiến lược và best practice trong lập trình, từ quản lý mã nguồn, thiết kế phần mềm, đến cách suy nghĩ logic và giải quyết vấn đề. Thông qua các ví dụ thực tiễn, độc giả sẽ học cách viết code rõ ràng, dễ bảo trì và phát triển kỹ năng nghề nghiệp bền vững.",
            category: "Công nghệ",
            price: 400000,
            quantity: 35,
            images: ["/images/books/10a.jpg", "/images/books/10b.jpg", "/images/books/10c.jpg", "/images/books/10d.jpg", "/images/books/10e.jpg"]
        }
    ];

    for (const b of booksData) {
        await prisma.product.create({
            data: {
                name: b.name,
                author: b.author,
                publisher: b.publisher,
                isbn: b.isbn,
                language: b.language,
                publishedYear: b.publishedYear,
                pages: b.pages,
                description: b.description,
                category: b.category,
                price: b.price,
                quantity: b.quantity,
                images: {
                    create: b.images.map(url => ({ url }))
                }
            }
        });
    }
}

main()
    .then(() => console.log("✅ Seed thành công"))
    .catch(e => console.error(e))
    .finally(async() => await prisma.$disconnect());