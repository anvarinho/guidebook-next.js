import { safeJsonLd } from '@/lib/seo';

const JsonLD = ({ data }) => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
);
export default JsonLD;