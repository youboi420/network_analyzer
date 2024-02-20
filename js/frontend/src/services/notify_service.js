import { Slide, toast } from 'react-toastify'

const NOTIFY_TYPES = {
  info: 1,
  success: 2,
  error: 3,
  warn: 4,
  short_error: 5
}

const notify = (text, type) => {
  switch (type){
    case NOTIFY_TYPES.info:
      toast.info(text, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      })
      break
    case NOTIFY_TYPES.success:
      toast.success(text, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      })
      break
    case NOTIFY_TYPES.error:
      toast.error(text, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      })
      break
    case NOTIFY_TYPES.warn:
      toast.warn(text, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      })
      break
      /* short_error */
    case NOTIFY_TYPES.short_error:
      toast.error(text, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      })
      break
    default:
      break
  }
}

export { notify, NOTIFY_TYPES}