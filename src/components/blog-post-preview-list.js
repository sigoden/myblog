import React from "react"

import Container from "../components/container"
import BlogPostPreviewItem from "../components/blog-post-preview-item"

import presets, { colors } from "../utils/presets"
import { rhythm, options } from "../utils/typography"
import logo from "../logo.svg"

class BlogPostPreviewList extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      posts: this.props.posts.slice(0, this.props.pageSize),
    }
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const d = document.documentElement
    const offset = d.scrollTop + window.innerHeight
    const height = d.offsetHeight

    if (offset > height - this.props.threshold) {
      let len = this.state.posts.length
      if (len >= this.props.posts.length) {
        return
      }
      this.setState({
        posts: this.props.posts.slice(0, len + this.props.pageSize),
      })
    }
  }

  render() {
    return (
      <div
        css={{
          [presets.Tablet]: {
            background: colors.ui.whisper,
            paddingBottom: rhythm(options.blockMarginBottom * 4),
          },
        }}
      >
        <Container
          css={{
            [presets.Tablet]: {
              background: `url(${logo})`,
              paddingTop: `${rhythm(
                options.blockMarginTop * 4
              )} !important`,
              paddingBottom: `${rhythm(
                options.blockMarginBottom * 4
              )} !important`,
              backgroundSize: `30px 30px`,
              backgroundRepeat: `no-repeat`,
              backgroundPosition: `bottom center`,
            },
          }}
        >

        {this.state.posts.map(({ node }) => (
          <BlogPostPreviewItem
            post={node}
            key={node.fields.slug}
            css={{
              marginBottom: rhythm(options.blockMarginBottom),
              [presets.Tablet]: {
                background: `#fff`,
                borderRadius: presets.radiusLg,
                boxShadow: `0 3px 10px rgba(25, 17, 34, 0.05)`,
                padding: rhythm(options.blockMarginBottom * 2),
                paddingLeft: rhythm(options.blockMarginBottom * 3),
                paddingRight: rhythm(options.blockMarginBottom * 3),
                marginLeft: rhythm(-options.blockMarginBottom * 2),
                marginRight: rhythm(-options.blockMarginBottom * 2),
                transition: `transform ${presets.animation.speedDefault} ${
                  presets.animation.curveDefault
                },  box-shadow ${presets.animation.speedDefault} ${
                  presets.animation.curveDefault
                }, padding ${presets.animation.speedDefault} ${
                  presets.animation.curveDefault
                }`,
                "&:hover": {
                  transform: `translateY(-4px)`,
                  boxShadow: `0 10px 42px rgba(25, 17, 34, 0.1)`,
                },
                "&:active": {
                  boxShadow: `0 3px 10px rgba(25, 17, 34, 0.05)`,
                  transform: `translateY(0)`,
                  transition: `transform 50ms`,
                },
              },
              [presets.Desktop]: {},
              [presets.Hd]: {},
            }}
          />
        ))}
        </Container>
      </div>
    )
  }
}

export default BlogPostPreviewList
