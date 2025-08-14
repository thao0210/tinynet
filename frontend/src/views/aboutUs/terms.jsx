import { useState } from "react";
import styles from "./styles.module.scss";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;
const contentData = {
  en: {
    terms: {
      title: "Terms of Use",
      items: [
        "By using our services, you agree to comply with these terms. If you do not agree, please stop using the app immediately.",
        "You agree not to upload any illegal, hateful, harmful, violent, threatening, defamatory, or infringing content.",
        "We are not responsible for the accuracy, legality, or reliability of user-generated content.",
        "We reserve the right to suspend, restrict, or terminate accounts that violate our community rules or applicable laws.",
        "Stars and points are virtual items with no monetary value and are non-refundable.",
        "You are responsible for keeping your account credentials secure. We are not liable for unauthorized account access due to user negligence.",
        "We may update, change, or remove features of the app at any time without prior notice.",
        "We reserve the right to modify these terms at any time. Updated terms will be posted on this page."
      ]
    },
    privacy: {
      title: "Privacy Policy",
      items: [
        "We collect only necessary information: your posts, drawings, and optional email address.",
        "We use your data solely for providing and improving our services.",
        "We do NOT sell, rent, or share your personal data with third parties, except as required by law.",
        "All user content is stored securely with industry-standard encryption and restricted access.",
        "We may use cookies to improve user experience, analyze traffic, and provide personalized features.",
        "You have the right to request access to, correction of, or deletion of your personal data at any time.",
        "Data deletion requests can be made by contacting us via email or by visiting our Data Deletion page.",
        "We retain your data only for as long as necessary to fulfill the purposes outlined in this policy.",
        `If you have privacy concerns, please contact us at: ${SUPPORT_EMAIL}`
      ]
    }
  },
  vi: {
    terms: {
      title: "Điều khoản sử dụng",
      items: [
        "Bằng việc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng ứng dụng ngay lập tức.",
        "Bạn đồng ý không đăng tải bất kỳ nội dung nào vi phạm pháp luật, thù ghét, gây hại, bạo lực, đe dọa, phỉ báng hoặc xâm phạm quyền sở hữu trí tuệ.",
        "Chúng tôi không chịu trách nhiệm về tính chính xác, hợp pháp hoặc độ tin cậy của nội dung do người dùng đăng tải.",
        "Chúng tôi có quyền tạm khóa, hạn chế hoặc chấm dứt tài khoản vi phạm quy tắc cộng đồng hoặc pháp luật hiện hành.",
        "Stars và điểm là các vật phẩm ảo, không có giá trị quy đổi tiền mặt và không được hoàn lại.",
        "Bạn có trách nhiệm bảo mật thông tin tài khoản của mình. Chúng tôi không chịu trách nhiệm cho việc truy cập trái phép do lỗi bảo mật từ phía người dùng.",
        "Chúng tôi có thể cập nhật, thay đổi hoặc gỡ bỏ tính năng của ứng dụng bất cứ lúc nào mà không cần báo trước.",
        "Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các điều khoản mới sẽ được đăng trên trang này."
      ]
    },
    privacy: {
      title: "Chính sách bảo mật",
      items: [
        "Chúng tôi chỉ thu thập các thông tin cần thiết: bài viết, hình vẽ, và địa chỉ email (nếu có).",
        "Dữ liệu của bạn chỉ được sử dụng nhằm cung cấp và cải thiện dịch vụ.",
        "Chúng tôi KHÔNG bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba, trừ khi pháp luật yêu cầu.",
        "Mọi nội dung của người dùng đều được lưu trữ an toàn với tiêu chuẩn mã hóa và quyền truy cập hạn chế.",
        "Chúng tôi có thể sử dụng cookie để cải thiện trải nghiệm, phân tích lưu lượng và cung cấp tính năng cá nhân hóa.",
        "Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân bất cứ lúc nào.",
        "Yêu cầu xóa dữ liệu có thể được thực hiện bằng cách liên hệ qua email hoặc truy cập trang Xóa dữ liệu.",
        "Chúng tôi chỉ lưu trữ dữ liệu của bạn trong thời gian cần thiết để thực hiện các mục đích đã nêu.",
        `Nếu bạn có thắc mắc về quyền riêng tư, vui lòng liên hệ: ${SUPPORT_EMAIL}`
      ]
    }
  }
};

export default function TermsPrivacy() {
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
        <h2 id="terms" className={styles.sectionTitle}>{data.terms.title}</h2>
        <ul className={styles.sectionList}>
          {data.terms.items.map(renderItem)}
        </ul>
      </div>

      <div className={styles.section}>
        <h2 id="privacy" className={styles.sectionTitle}>{data.privacy.title}</h2>
        <ul className={styles.sectionList}>
          {data.privacy.items.map(renderItem)}
        </ul>
      </div>
    </div>
  );
}
