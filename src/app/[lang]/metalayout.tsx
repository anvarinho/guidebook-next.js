import { Locale } from "@/lib/i18n.config";

interface Props {
    lang: Locale
}

const Meta: React.FC<Props> = ({ lang }) => {  
    const data = {
        "@context" : "https://schema.org",
        "@type" : "WebSite",
        "name" : "GuideBook of Kyrgyzstan",
        "url": `${process.env.NEXT_PUBLIC_URL}/${lang}`,
    }  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
  export default Meta;