export const aboutData = {
  en: {
    title: "About Us",
    intro: "Me (a hooman) – the brain, designer, frontend builder, a part of backend and bug squasher. ChatGPT – the tireless backend wizard. Together we built this site with:",
    tech: ["ReactJS + ViteJS (Frontend)", "NodeJS + ExpressJS (Backend)", "MongoDB (Database)",],
    sections: [
      {
        title: "What can you do here?",
        content: [
          "Write anything: diaries, essays, stories, or random thoughts.",
          "Create cards with videos, sounds, images, and chat boxes.",
          "Use Speech to Text if typing isn't your thing.",
          "Insert images, videos, self-drawings, signatures, and custom QR codes.",
          "Write in multiple languages.",
          "Read, watch, and listen (by Text To Speech technology), comment, vote... the posts here!"
        ]
      },
      {
        title: "Draw, Color, Share",
        content: [
          "Freestyle drawing with brushes and grid support.",
          "Color existing or uploaded images.",
          "Share posts, videos, and collections.",
          "Create anonymous posts, share secrets with password and OTP",
          "Create polls and let users vote anonymously or securely."
        ]
      },
      {
        title: "Stars System",
        content: [
          "10,000 Stars for first 10 users. 3,000 for the next 90. 500 for everyone else.",
          "Refer a friend = +500 Stars.",
          "Use Stars to buy themes, post locks, or promote posts.",
          "Weekly leaderboards reward top viewed and liked content."
        ]
      },
      {
        title: "Mini Games",
        content: [
          "Flip Coin, Lucky Wheel, Fast Typing, Lucky Number.",
          "Custom games for your own fun purposes."
        ]
      }
    ],
    contact: {
        title: "Support & Contact",
        content: [
          {
            text: "Like what you see? Fill out ",
            action: {
              label: "the form",
              onClick: "contact"
            },
            text2: ' or email us to ',
            action2: {
              label: 'info@tinynet.net',
              onClick: 'email'
            }
          },
          {
            text: "Want to support the site? Check ",
            action: {
              label: "donation methods",
              onClick: "donate"
            }
          }
        ]
      }
  },
  vi: {
    title: "Về chúng tôi",
    intro: "Tôi (người thật) – lo phần ý tưởng và sáng tạo, thiết kế và cày Frontend, một phần Backend và testing. ChatGPT – cày backend không mệt mỏi. Chúng tôi đã tạo nên website này với:",
    tech: ["ReactJS + ViteJS (Giao diện)", "NodeJS + ExpressJS (Xử lý backend)", "MongoDB (Lưu trữ dữ liệu)",],
    sections: [
      {
        title: "Bạn có thể làm gì ở đây?",
        content: [
          "Viết mọi thứ: nhật ký, truyện, ý kiến, hay cả thơ lục bát.",
          "Tạo card với video, âm thanh, hình ảnh và các hộp thoại",
          "Không thích gõ? Dùng nhận diện giọng nói.",
          "Chèn ảnh, video, chữ ký, hình tự vẽ và mã QR tuỳ chỉnh.",
          "Viết đa ngôn ngữ.",
          "Đọc, xem, và nghe (nếu lười đọc, dùng nhận diện chữ chuyển thành giọng đọc), bình luận, vote ... các bài post ở đây!"
        ]
      },
      {
        title: "Vẽ, Tô màu, Chia sẻ",
        content: [
          "Vẽ tự do với nhiều loại cọ và grid canh dễ dàng.",
          "Tô hình có sẵn hoặc hình bạn tự tải lên.",
          "Tạo bài viết ẩn danh, chia sẻ bí mật với mật khẩu và OTP",
          "Chia sẻ bài viết, video và gom vào collection.",
          "Tạo poll để user vote bài bạn yêu thích (có thể ẩn danh)."
        ]
      },
      {
        title: "Hệ thống Stars",
        content: [
          "10,000 Stars cho 10 user đầu tiên. 3,000 cho 90 người tiếp theo. 500 cho phần còn lại.",
          "Giới thiệu bạn bè = +500 Stars.",
          "Dùng Stars để mua theme, khoá post, đẩy bài lên top.",
          "Bảng xếp hạng hàng tuần thưởng user có bài view/comment cao."
        ]
      },
      {
        title: "Mini Game",
        content: [
          "Flip Coin, Lucky Wheel, Fast Typing, Lucky Number.",
          "Có thể tạo game riêng để dùng cho mục đích cá nhân."
        ]
      }
    ],
    contact: {
      title: "Liên hệ & Ủng hộ",
        content: [
          {
            text: "Nếu thấy hữu ích, hãy ",
            action: {
              label: "điền form hoặc gửi email",
              onClick: "contact"
            }
          },
          {
            text: "Muốn ủng hộ website? Xem ",
            action: {
              label: "các hình thức",
              onClick: "donate"
            }
          }
        ]
    }
  }
};