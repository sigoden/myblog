import React from "react"
import { graphql } from "gatsby"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { navigateTo } from "gatsby-link"
import { TagCloud } from "react-tagcloud"
import kebabCase from "lodash/kebabCase"
import DefaultLayout from "../components/default-layout"
import Container from "../components/container"

const Tag = (tag, size, color) => (
  <span
    key={tag.value}
    style={{
      fontSize: `${size}px`,
      color,
      cursor: 'pointer',
      margin: '0px 3px',
      verticalAlign: 'middle',
      display: 'inline-block'
    }}
  >
    {tag.value}
  </span>
)

const TagsPage = ({
  location,
  data,
}) => {
  const { allMarkdownRemark: { group }, site: { siteMetadata: { title } } } = data;
  return (
    <DefaultLayout location={location} githubUrl={data.site.siteMetadata.githubUrl}>
      <Helmet title={title} />
      <Container className="tag" css={{ paddingBottom: `0 !important` }}>
        <TagCloud tags={group.map(tag => ({ value: tag.fieldValue, count: tag.totalCount }))}
          minSize={30}
          maxSize={80}
          renderer={Tag}
          onClick={tag => navigateTo(`/tags/${kebabCase(tag.value)}/`)}
        />
      </Container>
    </DefaultLayout>
  )
}

TagsPage.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      group: PropTypes.arrayOf(
        PropTypes.shape({
          fieldValue: PropTypes.string.isRequired,
          totalCount: PropTypes.number.isRequired,
        }).isRequired
      ),
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }),
    }),
  }),
}

export default TagsPage

export const pageQuery = graphql`
  query PageQuery {
    site {
      siteMetadata {
        title
        githubUrl
      }
    }
    allMarkdownRemark(
      limit: 2000
    ) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`
