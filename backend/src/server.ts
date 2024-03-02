import app from './app'
import env from './config/environment'
import db from './config/mongodb'

const port = env.PORT || 4000

db.connect()
  .then(() => {
    db.initIndex()
    app.listen(port, () => console.log(`App listening on port ${port}`))
  })
  .catch((error) => {
    console.error(error)
    process.exit(0)
  })
