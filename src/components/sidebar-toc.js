import React from "react"
import Link from "gatsby-link"

import { rhythm, scale, options } from "../utils/typography"
import presets, { colors } from "../utils/presets"

const Section = props => (
  <div>
    <h3
      css={{
        ...props.headerStyles,
        marginTop: props.index === 0 ? 0 : rhythm(3 / 2),
      }}
    >
      {props.title}
    </h3>
    <SectionLinks
      {...props}
      title={props.title}
    />
  </div>
)

const SectionLinks = props => {
  const listStyles = {
    listStyle: `none`,
    margin: 0,
    padding: 0,
    fontFamily: options.headerFontFamily.join(`,`),
  }

  return (
    <ul
      css={{
        ...listStyles,
        // For nested <ul>s in the "Tutorial" section
        "& ul": {
          ...listStyles,
        },
      }}
    >
      {props.items.map((item, index) => (
        <SectionLink
          node={item}
          children={item.items}
          key={index}
          isInline={props.isInline}
        />
      ))}
    </ul>
  )
}

const SectionLink = props => {

  let childnodes = null
  if (props.children) {
    childnodes = props.children.map((childnode, index) => (
      <SectionLink
        key={index}
        node={childnode}
        children={childnode.items}
        isNested={true}
      />
    ))
  }

  const item = props.node

  // If the last character is a * then the doc page is still in draft
  const isDraft = false
  const title = item.title

  const styles = {
    listItem: {
      marginBottom: options.blockMarginBottom / 2,
      lineHeight: 1.3,
      paddingTop: rhythm(1 / 8),
      paddingLeft: props.isNested ? rhythm(1 / 2) : 0,
      paddingBottom: rhythm(1 / 8),
    },
    linkDefault: {
      position: `relative`,
      borderBottom: `none`,
      boxShadow: `none`,
      fontWeight: `normal`,
      color: isDraft ? colors.gray.calm : colors.gray.text,
      fontStyle: isDraft ? `italic` : false,
      "&:before": {
        content: ` `,
        height: 4,
        width: 4,
        borderRadius: `100%`,
        top: `.5em`,
        left: `-.7em`,
        fontWeight: `normal`,
        position: `absolute`,
        transform: `scale(0.1)`,
        transition: `all ${presets.animation.speedDefault} ${
          presets.animation.curveDefault
        }`,
        [presets.Hd]: {
          height: 6,
          width: 6,
          top: `.65em`,
          marginTop: -3,
          left: `-1em`,
        },
      },
    },
    linkActive: {
      opacity: 1,
      color: colors.gatsby,
      fontWeight: `bold`,
      "&:before": {
        background: colors.gatsby,
        transform: `scale(1)`,
      },
    },
  }

  const linkStyle = props.isNested
    ? {
        ...styles.listItem,
        "& .nav-link": {
          ...styles.linkDefault,
          color: isDraft ? colors.gray.calm : colors.gray.text,
        },
        "& .nav-link-active": {
          ...styles.linkActive,
          color: isDraft ? colors.gray.calm : colors.gray.text,
          fontWeight: `normal`,
          "&:before": {
            display: `none`,
          },
        },
      }
    : {
        ...styles.listItem,
        "& > .nav-link": {
          ...styles.linkDefault,
        },
        "& > .nav-link-active": {
          ...styles.linkActive,
        },
      }

  return (
    <li key={item.title} css={linkStyle}>
      {item.link.charAt(0) === `#` ? (
        <a href={item.link} className="nav-link">
          {title}
        </a>
      ) : (
        <Link
          to={item.link}
          activeClassName="nav-link-active"
          className="nav-link"
          exact
        >
          {title}
        </Link>
      )}
      {childnodes ? <ul>{childnodes}</ul> : null}
    </li>
  )
}

class SidebarToc extends React.Component {
  render() {
    const menu = this.props.toc
    const isInline = this.props.inline

    // Use original sizes on mobile as the text is inline
    // but smaller on > tablet so as not to compete with body text.
    const fontSize = isInline ? scale(0).fontSize : scale(-2 / 10).fontSize
    const headerStyles = isInline
      ? {
          fontSize: scale(2 / 5).fontSize,
        }
      : {
          fontSize: scale(-2 / 5).fontSize,
          color: colors.lilac,
          textTransform: `uppercase`,
          letterSpacing: `.15em`,
          fontWeight: `normal`,
        }

    return (
      <div
        css={{
          padding: isInline ? 0 : rhythm(3 / 4),
        }}
        className="sidebar-toc"
      >
        {menu.map((section, index) => (
          <div
            key={index}
            css={{
              fontSize,
            }}
          >
            <Section
              {...section}
              title={section.title}
              headerStyles={headerStyles}
              index={index}
              isInline={isInline}
            />
          </div>
        ))}
      </div>
    )
  }
}

export default SidebarToc
