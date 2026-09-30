import { absoluteSiteUrl, safeJsonLd } from "@/lib/seo";
import { Locale } from "@/lib/i18n.config";

interface Props {
    lang: Locale
}

const Meta: React.FC<Props> = ({ lang }) => {  
    const data = {
        "@context" : "https://schema.org",
        "@type" : "WebSite",
        "name" : "GuideBook of Kyrgyzstan",
        "url": absoluteSiteUrl(lang),
    }  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
      />
    );
  };
  
  export default Meta;