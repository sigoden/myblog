import React from "react"
import Helmet from "react-helmet"
import Link from "gatsby-link"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"

import presets, { colors } from "../utils/presets"
import typography, { rhythm, scale, options } from "../utils/typography"
import Container from "../components/container"
import SidebarToc from "../components/sidebar-toc"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const prev = this.props.pathContext.prev
    const next = this.props.pathContext.next
    const siteMetadata = this.props.data.site.siteMetadata

    const prevNextLinkStyles = {
      "&&": {
        boxShadow: `none`,
        borderBottom: 0,
        fontFamily: options.headerFontFamily.join(`,`),
        fontWeight: `bold`,
        color: colors.gatsby,
      },
    }
    const prevNextLabelStyles = {
      marginTop: 0,
      marginBottom: 0,
      color: colors.gray.calm,
      fontWeight: `normal`,
      ...scale(0),
      lineHeight: 1,
    }

    const hasSidebar = !post.frontmatter.notoc

    const leftPadding = rhythmSize => {
      if (hasSidebar) {
        return rhythm(rhythmSize)
      } else {
        return 0
      }
    }

    const sidebarStyles = {
      borderRight: `1px solid ${colors.ui.light}`,
      backgroundColor: colors.ui.whisper,
      width: rhythm(10),
      display: `none`,
      position: `fixed`,
      top: `calc(${presets.headerHeight} - 1px)`,
      overflowY: `auto`,
      height: `calc(100vh - ${presets.headerHeight} + 1px)`,
      WebkitOverflowScrolling: `touch`,
      "::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      "::-webkit-scrollbar-thumb": {
        background: colors.ui.bright,
      },
      "::-webkit-scrollbar-track": {
        background: colors.ui.light,
      },
    }

    const sidebarStylesDesktop = {
      [presets.Desktop]: {
        width: rhythm(12),
        padding: rhythm(1),
      },
    }

    const BioLine = ({ children }) => (
      <p
        css={{
          ...scale(-2 / 5),
          fontFamily: typography.options.headerFontFamily.join(`,`),
          lineHeight: 1.3,
          paddingBottom: rhythm(1),
          margin: 0,
          color: colors.gray.calm,
          [presets.Mobile]: {
            ...scale(-1 / 5),
            lineHeight: 1.3,
          },
        }}
      >
        {children}
      </p>
    )
    const getToc = () => {
      const headings = post.headings
      let toc = {
        title: 'TOC',
        items: [],
      }
      let lastHeading
      for (const h of headings) {
        let heading = {
          title: h.value,
          link: `#${slugger(h.value)}`,
          depth: h.depth,
        }
        if (!lastHeading) {
          heading.parent = toc
          toc.items.push(heading)
          lastHeading = heading
          continue
        }

        if (lastHeading.depth == heading.depth) {
          heading.parent = lastHeading.parent
        } else if (lastHeading.depth < heading.depth) {
          if (!lastHeading.items) {
            lastHeading.items = []
          }
          heading.parent = lastHeading
        } else {
          heading.parent = lastHeading.parent.parent
        }
        heading.parent.items.push(heading)
        lastHeading = heading
      }
      return [toc]
    } 
    return (
      <div className={hasSidebar ? `post has-sidebar` : `post`}>
        <div
          css={{
            ...sidebarStyles,
            [presets.Tablet]: {
              display: hasSidebar ? `block` : `none`,
            },
            ...sidebarStylesDesktop,
          }}
        >
          <SidebarToc toc={getToc()} />
        </div>
        <div 
          css={{
            display: `block`,
            [presets.Tablet]: {
              paddingLeft: leftPadding(10),
            },
            [presets.Desktop]: {
              paddingLeft: leftPadding(12),
            },
          }}
          >
          <Container className="post-content" css={{ paddingBottom: `0 !important` }}>
            {/* Add long list of social meta tags */}
            <Helmet>
              <title>{post.frontmatter.title}</title>
              <link
                rel="author"
                href={`${siteMetadata.siteUrl}/about/`}
              />
              <meta
                name="description"
                content={
                  post.frontmatter.excerpt
                    ? post.frontmatter.excerpt
                    : post.excerpt
                }
              />

              <meta name="og:description" content={post.frontmatter.excerpt} />
              <meta name="og:type" content="article" />
              <meta name="article:author" content={siteMetadata.siteAuthor} />
              <meta name="author" content={siteMetadata.siteAuthor} />
              <meta
                name="article:published_time"
                content={post.frontmatter.rawDate}
              />
            </Helmet>
            <h1
              css={{
                marginTop: 0,
                [presets.Desktop]: {
                  marginBottom: rhythm(5 / 4),
                },
              }}
            >
              {this.props.data.markdownRemark.frontmatter.title}
            </h1>
            <BioLine>
              {post.timeToRead} min read · {post.frontmatter.date}
            </BioLine>
            <div
              className="post-body"
              dangerouslySetInnerHTML={{
                __html: this.props.data.markdownRemark.html,
              }}
            />
          </Container>
          <div
            css={{
              borderTop: `1px solid ${colors.ui.light}`,
              marginTop: rhythm(2),
              [presets.Tablet]: {
                marginTop: rhythm(2),
                paddingBottom: rhythm(1),
                paddingTop: rhythm(1),
              },
              [presets.Desktop]: {
                marginTop: rhythm(3),
                paddingBottom: rhythm(2),
                paddingTop: rhythm(2),
              },
            }}
          >
            <Container>
              <div
                css={{ [presets.Phablet]: { display: `flex`, width: `100%` } }}
              >
                <div
                  css={{
                    [presets.Phablet]: {
                      width: `50%`,
                    },
                  }}
                >
                  {prev && (
                    <Link to={prev.fields.slug} css={prevNextLinkStyles}>
                      <span
                        css={{
                          [presets.Tablet]: {
                            marginLeft: `-1rem`,
                          },
                        }}
                      >
                        <ArrowBackIcon style={{ verticalAlign: `sub` }} />
                        {prev.frontmatter.title}
                      </span>
                    </Link>
                  )}
                </div>
                <div
                  css={{
                    textAlign: `right`,
                    marginTop: rhythm(1),
                    [presets.Phablet]: { marginTop: 0, width: `50%` },
                  }}
                >
                  {next && (
                    <Link to={next.fields.slug} css={prevNextLinkStyles}>
                      <span
                        css={{
                          [presets.Tablet]: {
                            marginRight: `-1rem`,
                          },
                        }}
                      >
                        {next.frontmatter.title}
                        <ArrowForwardIcon style={{ verticalAlign: `sub` }} />
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </Container>
          </div>
        </div>
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query TemplateBlogPost($slug: String!) {
    site {
      siteMetadata {
        title
        siteUrl
        siteAuthor
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      headings {
        value
        depth
      }
      frontmatter {
        title
        notoc
        excerpt
        date(formatString: "MMMM Do YYYY")
        rawDate: date
      }
    }
  }
`

function slugger (string, maintainCase) {
  const re = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g
  const replacement = '-'
  const whitespace = /\s/g

  if (typeof string !== 'string') return ''
  if (!maintainCase) string = string.replace(/[A-Z]+/g, string => string.toLowerCase())
  return string.trim()
    .replace(re, '')
    .replace(whitespace, replacement)
}
