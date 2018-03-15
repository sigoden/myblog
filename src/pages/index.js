import React from "react"

import BlogPostPreviewList from "../components/blog-post-preview-list"

export default ({ data }) => {
  const { allMarkdownRemark: { edges }, site: { siteMetadata }} = data
  return (
    <BlogPostPreviewList 
      posts={edges}
      pageSize={siteMetadata.pageSize}
      threshold={siteMetadata.pageScrollLoadThreshold}
    />
  )
}

export const pageQuery = graphql`
  query BlogPostsIndexQuery {
    site {
      siteMetadata {
        pageSize
        pageScrollLoadThreshold
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
    ) {
      totalCount
      edges {
        node {
          excerpt
          frontmatter {
            slug
            tags
            excerpt
            title
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`
