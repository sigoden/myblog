import React from "react"

import BlogPostPreviewList from "../components/blog-post-preview-list"

export default ({ pathContext, data }) => {

  const { allMarkdownRemark: { edges }, site: { siteMetadata }} = data

  let posts = edges
  if (process.env.NODE_ENV === 'production') {
    posts = posts.filter(post => !post.node.frontmatter.draft)
  }

  return (
    <BlogPostPreviewList 
      posts={posts}
      pageSize={siteMetadata.pageSize}
      threshold={siteMetadata.pageScrollLoadThreshold}
    />
  )
}

export const pageQuery = graphql`
  query TagPage($tag: String) {
    site {
      siteMetadata {
        pageSize
        pageScrollLoadThreshold
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] }}}
    ) {
      totalCount
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            tags
            excerpt
            draft
            title
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`
