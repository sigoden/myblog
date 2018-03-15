import React from "react"

import BlogPostPreviewList from "../components/blog-post-preview-list"

export default ({ pathContext, data }) => {

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
      filter: { frontmatter: { tags: { in: [$tag] } } }
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
