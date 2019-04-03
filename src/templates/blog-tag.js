import React from "react"
import { graphql } from "gatsby"

import BlogPostPreviewList from "../components/blog-post-preview-list"
import DefaultLayout from "../components/default-layout"

export default ({ data, location }) => {

  const { allMarkdownRemark: { edges }, site: { siteMetadata } } = data

  let posts = edges
  if (process.env.NODE_ENV === 'production') {
    posts = posts.filter(post => !post.node.frontmatter.draft)
  }

  return (
    <DefaultLayout location={location} githubUrl={data.site.siteMetadata.githubUrl}>
      <BlogPostPreviewList
        posts={posts}
        pageSize={siteMetadata.pageSize}
        threshold={siteMetadata.pageScrollLoadThreshold}
      />
    </DefaultLayout>
  )
}

export const pageQuery = graphql`
  query TagPage($tag: String) {
    site {
      siteMetadata {
        pageSize
        pageScrollLoadThreshold
        githubUrl
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
