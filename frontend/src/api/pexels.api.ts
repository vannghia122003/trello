import { createClient, PaginationParams } from 'pexels'

const client = createClient('cDbiTgt3boeXD9dCYQi3Hi3ojlXMyPPMQUR8Svl2Z1hkQjs5r3UhXq4G')

const pexelsApi = {
  getCuratedPhotos(params: PaginationParams) {
    return client.photos.curated(params)
  },
  searchPhotos({ params, query }: { params?: PaginationParams; query: string }) {
    return client.photos.search({ ...params, query })
  }
}

export default pexelsApi
