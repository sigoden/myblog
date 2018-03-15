const path = require(`path`)
const _ = require('lodash')

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  const blogPostTemplate = path.resolve('./src/templates/blog-post.js')
  const blogTagTemplate = path.resolve('./src/templates/blog-tag.js')

  return graphql(`
    {
      allMarkdownRemark (
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 2000
      ) {
        edges {
          node {
            frontmatter {
              title
              tags
              slug
            }
          }
        }
      }
    }
  `
  ).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const posts = result.data.allMarkdownRemark.edges

    posts.forEach(({ node }, index) => {
      const next = index === 0 ? false : posts[index - 1].node
      const prev = index === posts.length - 1 ? false : posts[index + 1].node
      createPage({
        path: node.frontmatter.slug,
        component: blogPostTemplate,
        context: {
          slug: node.frontmatter.slug,
          prev,
          next,
        },
      })
    })

    let tags = [];
    _.each(posts, edge => {
      if (_.get(edge, 'node.frontmatter.tags')) {
        tags = tags.concat(edge.node.frontmatter.tags);
      }
    })

    tags = _.uniq(tags)

    tags.forEach(tag => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: blogTagTemplate,
        context: {
          tag,
        },
      })
    })

  })
}


