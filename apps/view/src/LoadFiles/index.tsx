import React, {useState, useEffect} from 'react'
import {Formik, Form, Field} from 'formik'

import {useAppState} from '../state'
import {Button, Icon, Fade} from '../ui'
import {FileEvent} from '../types'

const UPLOAD_MESSAGE = 'Upload your Gerber and drill files to render your board'
const UPLOAD_SUBMESSAGE = 'ZIP files work, too'

const MESSAGE_STYLE = 'absolute absolute--center near-black tc'

export type LoadFilesProps = {
  handleFiles: (event: FileEvent) => void
  handleUrl: (url: string) => void
}

export default function LoadFiles(props: LoadFilesProps): JSX.Element {
  const {mode, loading} = useAppState()
  const [initialUrl, setInitialUrl] = useState('')

  useEffect(() => {
    const {origin, pathname} = window.location
    setInitialUrl(`${origin}${pathname}arduino-uno.zip`)
  }, [])

  return (
    <>
      <Fade in={loading}>
        <Icon
          className={`${MESSAGE_STYLE} f1 brand`}
          name="spinner"
          faProps={{pulse: true}}
        />
      </Fade>
      <Fade in={initialUrl && !mode && !loading}>
        <div className={MESSAGE_STYLE}>
          <label className="db pv4 pointer">
            <input
              type="file"
              className="clip"
              onChange={props.handleFiles}
              multiple
            />
            <Icon name="plus" className="dib f1 brand" />
            <p className="mt3 mb0 f4 lh-copy">
              {UPLOAD_MESSAGE}
              <br />
              <span className="f5 fw3">({UPLOAD_SUBMESSAGE})</span>
            </p>
          </label>
          <Formik
            initialValues={{url: initialUrl}}
            onSubmit={values => props.handleUrl(values.url)}
          >
            {formProps => (
              <Form>
                <label htmlFor="load-file_url" className="db pointer mb2">
                  or enter the URL of a ZIP archive
                </label>
                <div className="flex items-bottom h2">
                  <Field
                    id="load-file_url"
                    name="url"
                    type="text"
                    className="w-100 mh2 bb bt-0 br-0 bl-0 b--near-black code f6 tc bg-transparent"
                  />
                  <Button
                    type="submit"
                    className="flex-none nr4 brand"
                    disabled={!formProps.values.url}
                  >
                    <Icon name="check" />
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Fade>
    </>
  )
}
