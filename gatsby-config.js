module.exports = {
  siteMetadata: {
    title: 'Sigoden | Blog',
    description: 'Blogger and Programer',
    siteUrl: 'https://blog.sigoden.com',
    githubUrl: 'https://github.com/sigoden',
    siteAuthor: 'sigoden',
    pageSize: 10,
    pageScrollLoadThreshold: 300,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blogs`,
        path: `${__dirname}/blogs`,
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 786,
              backgroundColor: `#ffffff`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.05rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-autolink-headers`,
        ],
      },
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        color: `#9D7CBF`,
        showSpinner: false,
      },
    },
    `gatsby-plugin-glamor`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-react-next`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `SigodenBlog`,
        short_name: `SigodenBlog`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        navigateFallback: null,
        navigateFallbackWhitelist: [],
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      frontmatter {
                        title
                        date
                        excerpt
                      }
                    }
                  }
                }
              }
            `,
            output: `/rss.xml`,
            setup: ({ query: { site: { siteMetadata } } }) => {
              return {
                title: siteMetadata.title,
                description: siteMetadata.description,
                feed_url: siteMetadata.siteUrl + `/rss.xml`,
                site_url: siteMetadata.siteUrl,
                generator: `sigoden`,
              }
            },
            serialize: ({ query: { site, allMarkdownRemark } }) =>
              allMarkdownRemark.edges.map(({ node }) => {
                return {
                  title: node.frontmatter.title,
                  description: node.frontmatter.excerpt || node.excerpt,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                  author: "sigoden",
                }
              }),
          },
        ],
      },
    },
  ],
}
