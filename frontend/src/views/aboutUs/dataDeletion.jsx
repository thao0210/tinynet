import { useState } from "react";
import styles from "./styles.module.scss";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;

const contentData = {
  en: {
    deletion: {
      title: "Data Deletion Instructions",
      items: [
        "If you wish to request the deletion of your data associated with our app, please follow the steps below:",
        `Send an email to ${SUPPORT_EMAIL} with the subject line “Delete My Data”.`,
        "In your email, please include your full name and the he account ID or email used to log in (Facebook or Google) used with our app.",
        "Once we receive your request, we will delete your data from our systems within 7 business days.",
        "You will receive a confirmation email once your data has been deleted.",
        "If you have any questions regarding our privacy practices, please visit our Privacy Policy page."
      ]
    }
  },
  vi: {
    deletion: {
      title: "Hướng dẫn xóa dữ liệu",
      items: [
        "Nếu bạn muốn yêu cầu xóa dữ liệu liên kết với ứng dụng của chúng tôi, vui lòng làm theo các bước sau:",
        `Gửi email đến ${SUPPORT_EMAIL} với tiêu đề “Xóa dữ liệu của tôi”.`,
        "Trong email, vui lòng cung cấp họ tên và ID tài khoản Facebook hoặc Google đã sử dụng với ứng dụng.",
        "Khi nhận được yêu cầu, chúng tôi sẽ xóa dữ liệu của bạn khỏi hệ thống trong vòng 7 ngày làm việc.",
        "Bạn sẽ nhận được email xác nhận khi dữ liệu đã được xóa.",
        "Nếu có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng truy cập trang Chính sách bảo mật."
      ]
    }
  }
};

export default function DataDeletion() {
  const [lang, setLang] = useState("en");
  const data = contentData[lang];

  const renderItem = (item, idx) => {
    const emailMatch = item.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      const email = emailMatch[0];
      const [before, after] = item.split(email);
      return (
        <li key={idx}>
          {before}
          <a href={`mailto:${email}`}>{email}</a>
          {after}
        </li>
      );
    }
    return <li key={idx}>{item}</li>;
  };

  return (
    <div className={styles.container}>
      <Tabs value={lang} onValueChange={setLang} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{data.deletion.title}</h2>
        <ul className={styles.sectionList}>
          {data.deletion.items.map(renderItem)}
        </ul>
      </div>
    </div>
  );
}
