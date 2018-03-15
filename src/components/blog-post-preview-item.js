import React from "react"
import Link,  { navigateTo } from "gatsby-link"
import { kebabCase } from "lodash"

import typography, { rhythm, scale } from "../utils/typography"
import presets, { colors } from "../utils/presets"

class BlogPostPreviewItem extends React.Component {
  render() {
    const post = this.props.post

    return (
      <article
        className={this.props.className}
        css={{ position: `relative`, cursor: `pointer` }} 
        onClick={e => {
          if (e.target.tagName === 'A') {
            return
          }
          navigateTo(`/${_.kebabCase(post.frontmatter.slug)}`)
        }}
      >
        <div>
          <h2>{post.frontmatter.title}</h2>
          <div
            css={{
              display: `flex`,
              alignItems: `center`,
              marginBottom: rhythm(1),
            }}
          >
            <div>
              {post.frontmatter.tags.map(tag => (
                <Link key={tag} to={`/tags/${_.kebabCase(tag)}`} css={{
                  marginRight: rhythm(0.25),
                }}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
          <p css={{ fontWeight: `normal` }}>
            {post.frontmatter.excerpt ? post.frontmatter.excerpt : post.excerpt}
          </p>
          <div
            css={{
              display: `flex`,
              alignItems: `flex-end`,
              flexDirection: `column`,
              marginBottom: rhythm(1),
            }}
          >
            <div css={{marginRight: rhythm(1)}}>
              {post.frontmatter.date}
            </div>
          </div>
        </div>
      </article>
    )
  }
}

export default BlogPostPreviewItem
