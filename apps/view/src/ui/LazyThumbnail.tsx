import React, {useState, useRef, useEffect} from 'react'
import cx from 'classnames'

import {Icon} from './Icon'

export type LazyThumbnailProps = {
  url: string
  spinnerColor: string
  className?: string
}

const STYLE = 'flex items-center justify-center'

export function LazyThumbnail(props: LazyThumbnailProps): JSX.Element {
  const imageRef = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const handleLoad = (): void => setLoaded(true)

    if (imageRef.current) {
      if (!imageRef.current.complete) {
        setLoaded(false)
        imageRef.current.addEventListener('load', handleLoad)
      } else {
        handleLoad()
      }
    }

    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', handleLoad)
      }
    }
  })

  const {url, spinnerColor} = props
  const className = cx(STYLE, props.className)
  const background = loaded
    ? `url("${url}") no-repeat center/contain`
    : 'transparent'

  return (
    <div className={className} style={{background}}>
      <img className="clip" ref={imageRef} src={url} />
      {!loaded && (
        <Icon
          name="spinner"
          className="f2"
          style={{color: spinnerColor}}
          faProps={{pulse: true}}
        />
      )}
    </div>
  )
}
