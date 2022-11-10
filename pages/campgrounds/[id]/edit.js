import { useRouter } from 'next/router'
import axios from 'axios'
import Form from '../../../components/Form'
import { getCampground, getCampgrounds } from '../../../util/campgrounds'

const EditCampground = ({ campground }) => {
  const router = useRouter()

  const handleSubmit = async data => {
    await axios.patch(`/api/campgrounds/${campground._id}`, data)
    router.push('/campgrounds')
  }

  return (
    <section className='text-dark px-10 mt-5 md:mt-10 lg:px-20 flex flex-col gap-8 items-center'>
      <h3 className='font-volkhov max-w-max text-xl md:text-2xl'>
        Edit {campground.name}
      </h3>
      <Form btnText='Done' data={campground} submitForm={handleSubmit} />
    </section>
  )
}

export async function getStaticPaths() {
  // Fetch campground ids
  const campgrounds = await getCampgrounds('_id')
  // Map over the ids and create path obj
  const paths = campgrounds.map(campground => ({
    params: { id: campground._id.toString() },
  }))

  return { paths, fallback: true }
}

export async function getStaticProps({ params }) {
  // Fetch campground data
  const campground = await getCampground(params.id)
  // Send the data as prop
  return {
    props: { campground },
    // Revalidate the page after 10 secs
    revalidate: 10,
  }
}

export default EditCampground
