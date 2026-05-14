import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
    title, 
    description, 
    keywords, 
    image, 
    url, 
    type = 'website',
    noindex = false 
}) => {
    const siteTitle = 'Anandamoyee India';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = 'Leading the way in rice mill machinery innovation. We empower farmers and millers with state-of-the-art technology for a sustainable future.';
    const metaDescription = description || defaultDescription;
    const siteUrl = 'https://www.anandamoyeeindia.com';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const defaultImage = `${siteUrl}/logo.png`;
    const metaImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* Canonical link */}
            <link rel="canonical" href={fullUrl} />
        </Helmet>
    );
};

export default SEO;
