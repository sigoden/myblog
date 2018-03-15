import React from "react"
import Link from "gatsby-link"
import GithubIcon from "react-icons/lib/go/mark-github"
import logo from "../logo.svg"
import typography, { rhythm, scale } from "../utils/typography"
import presets, { colors } from "../utils/presets"

const navItemStyles = {
  ...scale(-1 / 3),
  boxSizing: `border-box`,
  display: `inline-block`,
  color: `inherit`,
  textDecoration: `none`,
  textTransform: `uppercase`,
  letterSpacing: `0.03em`,
  lineHeight: `calc(${presets.headerHeight} - 6px)`,
  padding: `6px ${rhythm(1 / 2)} 0`,
  position: `relative`,
  top: 0,
  transition: `color .15s ease-out`,
  "&:hover": {
    opacity: 0.8,
  },
}
const NavItem = ({ linkTo, children }) => (
  <li
    css={{
      display: `inline-block`,
      margin: 0,
    }}
  >
    <Link to={linkTo} css={navItemStyles}>
      {children}
    </Link>
  </li>
)

export default ({ pathname, githubUrl }) => {
  const isHomepage = pathname == `/`
  let styles = {}
  styles.backgroundColor = `#fff`
  styles[presets.Tablet] = {
    borderBottomColor: `transparent`,
    position: `absolute`,
    backgroundColor: colors.ui.whisper,
  }
  const socialIconsStyles = {
    color: colors.lilac,
    [presets.Phablet]: {
      color: false,
    },
  }

  return (
    <div
      role="navigation"
      css={{
        borderBottom: `1px solid ${colors.ui.light}`,
        backgroundColor: `rgba(255,255,255,0.975)`,
        position: isHomepage ? `absolute` : false,
        height: presets.headerHeight,
        zIndex: `2`,
        left: 0,
        right: 0,
        [presets.Tablet]: {
          position: `absolute`,
        },
        ...styles,
      }}
    >
      <div
        css={{
          //maxWidth: rhythm(presets.maxWidth),
          margin: `0 auto`,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
          fontFamily: typography.options.headerFontFamily.join(`,`),
          display: `flex`,
          alignItems: `center`,
          width: `100%`,
          height: `100%`,
        }}
      >
        <Link
          to="/"
          css={{
            alignItems: `center`,
            color: `inherit`,
            display: `flex`,
            textDecoration: `none`,
            marginRight: rhythm(1 / 2),
          }}
        >
          <img
            src={logo}
            css={{
              height: 28,
              width: `auto`,
              margin: 0,
            }}
            alt=""
          />
        </Link>
        <ul
          css={{
            display: `none`,
            [presets.Tablet]: {
              display: `flex`,
              margin: 0,
              padding: 0,
              listStyle: `none`,
              flexGrow: 1,
              overflowX: `auto`,
              maskImage: `linear-gradient(to right, transparent, white ${rhythm(
                1 / 8
              )}, white 98%, transparent)`,
            },
          }}
        >
          <NavItem linkTo="/tags/">标签</NavItem>
        </ul>
        <div
          css={{
            display: `flex`,
            marginLeft: `auto`,
          }}
        >
          <a
            href={githubUrl}
            title="GitHub"
            css={{
              ...navItemStyles,
              ...socialIconsStyles,
            }}
          >
            <GithubIcon style={{ verticalAlign: `text-top` }} />
          </a>

          <div
            css={{
              display: `none`,
              [presets.Desktop]: { display: !isHomepage && `inline-block` },
              [presets.Hd]: { display: `inline-block` },
            }}
          >
          </div>
        </div>
      </div>
    </div>
  )
}
