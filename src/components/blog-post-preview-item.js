import React from "react"
import Link from "gatsby-link"

import typography, { rhythm, scale } from "../utils/typography"
import presets, { colors } from "../utils/presets"

class BlogPostPreviewItem extends React.Component {
  render() {
    const post = this.props.post

    return (
      <article className={this.props.className} css={{ position: `relative` }}>
        <Link to={post.frontmatter.slug}>
          <h2>{post.frontmatter.title}</h2>
          <p css={{ fontWeight: `normal` }}>
            {post.frontmatter.excerpt ? post.frontmatter.excerpt : post.excerpt}
          </p>
        </Link>
        <div
          css={{
            display: `flex`,
            alignItems: `center`,
            marginBottom: rhythm(2),
          }}
        >
          <div>
            {` `}
            on
            {` `}
            {post.frontmatter.date}
          </div>
        </div>
        <Link
          to={post.frontmatter.slug}
          css={{
            position: `absolute`,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: `hidden`,
            textIndent: `-100%`,
            whiteSpace: `nowrap`,
            zIndex: 0,
            "&&": {
              border: 0,
              boxShadow: `none`,
              "&:hover": {
                background: `none`,
              },
            },
          }}
        >
          Read more
        </Link>
      </article>
    )
  }
}

export default BlogPostPreviewItem
