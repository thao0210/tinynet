import { useState } from "react";
import styles from "./styles.module.scss";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";

const contentData = {
  en: {
    terms: {
      title: "Terms of Use",
      items: [
        "You agree not to upload illegal, hateful, or harmful content.",
        "We are not responsible for user-generated content.",
        "We may suspend accounts violating our community rules.",
        "Stars and points are virtual and non-refundable.",
        "We reserve the right to change these terms anytime."
      ]
    },
    privacy: {
      title: "Privacy Policy",
      items: [
        "We collect only what's needed: your posts, drawings, and optional email.",
        "We do NOT share your data with any third parties.",
        "You may request to delete your data by contacting us.",
        "All user content is stored securely.",
        "Cookies may be used to enhance user experience."
      ]
    }
  },
  vi: {
    terms: {
      title: "Điều khoản sử dụng",
      items: [
        "Bạn đồng ý không đăng tải nội dung vi phạm pháp luật hoặc gây hại.",
        "Chúng tôi không chịu trách nhiệm cho nội dung do người dùng đăng.",
        "Chúng tôi có thể khóa tài khoản nếu vi phạm quy tắc cộng đồng.",
        "Stars và điểm là ảo và không hoàn tiền.",
        "Chúng tôi có quyền thay đổi điều khoản bất kỳ lúc nào."
      ]
    },
    privacy: {
      title: "Chính sách bảo mật",
      items: [
        "Chúng tôi chỉ thu thập thông tin cần thiết: bài viết, hình vẽ, và email (nếu có).",
        "Chúng tôi KHÔNG chia sẻ dữ liệu của bạn cho bên thứ ba.",
        "Bạn có thể yêu cầu xóa dữ liệu bất kỳ lúc nào qua email.",
        "Mọi nội dung người dùng đều được lưu trữ an toàn.",
        "Chúng tôi có thể sử dụng cookie để cải thiện trải nghiệm sử dụng."
      ]
    }
  }
};

export default function TermsPrivacy() {
  const [lang, setLang] = useState("en");
  const data = contentData[lang];

  return (
    <div className={styles.container}>
      <Tabs value={lang} onValueChange={setLang} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{data.terms.title}</h2>
        <ul className={styles.sectionList}>
          {data.terms.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{data.privacy.title}</h2>
        <ul className={styles.sectionList}>
          {data.privacy.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
