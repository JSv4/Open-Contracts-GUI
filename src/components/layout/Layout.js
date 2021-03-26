import Header from './Header'
import Footer from './Footer'

function Layout({ user, loading = false, children }) {
  return (
    <>
      <Header user={user} loading={loading} />
      <main>
        <div className="container">{children}</div>
      </main>
      <Footer/>
    </>
  )
}

export default Layout
