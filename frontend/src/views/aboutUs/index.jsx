import { useState } from "react";
import { aboutData } from "@/sharedConstants/aboutUs";
import styles from "./styles.module.scss";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { useStore } from '@/store/useStore';

const AboutUs = () => {
   const [lang, setLang] = useState("en");
   const data = aboutData[lang];
   const {setShowModal} = useStore();
   const baseUrl = import.meta.env.VITE_R2_BASE_URL;
   const handleClick = (type) => {
    if (type === "contact") setShowModal('contactUs');
    if (type === "donate") setShowModal('donateMethod');
    }

    return (
        <div className={styles.container}>
            <Tabs value={lang} onValueChange={setLang} className={styles.tabs}>
                <TabsList className={styles.tabsList}>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                </TabsList>
            </Tabs>

            <h1 className={styles.title}>{data.title}</h1>
            <p className={styles.intro}>{data.intro}</p>

            <ul className={styles.techList}>
                {data.tech.map((item, idx) => (
                <li key={idx}>{item}</li>
                ))}
            </ul>

            <div>
                <img src={`${baseUrl}/aboutUs.webp`} width={800} />
            </div>

            {data.sections.map((section, i) => (
                <div key={i} className={styles.section}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <ul className={styles.sectionList}>
                    {section.content.map((line, j) => (
                    <li key={j}>{line}</li>
                    ))}
                </ul>
                </div>
            ))}
            <div>
                <h2>{data.contact.title}</h2>
                <ul>
                    {data.contact.content.map((line, idx) => (
                        <li key={idx}>
                            {line.text}
                            <span
                                className={styles.link}
                                onClick={() => handleClick(line.action.onClick)}
                            >
                            {line.action.label}
                            </span>
                            {line.text2}
                            {
                                line.action2 &&
                                <a href={`mailto: ${line.action2.label}`}>
                                    {line.action2.label}
                                </a>
                            }
                        </li>
                        ))}
                </ul>
            </div>
        </div>
    )
}

export default AboutUs;