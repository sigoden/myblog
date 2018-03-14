import React from "react"
import Link from "gatsby-link"

export default ({ data }) => {
  return (
    <div>
      <h2>
        Amazing Pandas Eating Things
      </h2>
      <h4>
        {data.allMarkdownRemark.totalCount} Posts
      </h4>
      {data.allMarkdownRemark.edges.map(({ node }) =>
        <div key={node.id}>
          <Link
            to={node.frontmatter.slug}
          >
            <h3>
              {node.frontmatter.title}{" "}
              <span>— {node.frontmatter.date}</span>
            </h3>
            <p>
              {node.frontmatter.excerpt}
            </p>
          </Link>
        </div>
      )}
    </div>
  )
}

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            slug
            date(formatString: "DD MMMM, YYYY")
            excerpt
          }
        }
      }
    }
  }
`
