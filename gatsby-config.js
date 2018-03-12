module.exports = {
  siteMetadata: {
    title: `Blogger and Programer`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/markdowns`,
      },
    },
    `gatsby-transformer-remark`
  ],
};
