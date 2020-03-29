import React, {useState} from 'react'
import {Formik, Form, Field, FieldProps} from 'formik'

import {PRIVACY_URL} from '../pkg'
import {useTimeout} from '../hooks'
import {useAppState, updateAppPreferences} from '../state'
import {Fade, Checkbox, Button} from '../ui'
import {AppPreferences} from '../types'

const TITLE_COPY = 'welcome to tracespace view!'
const USAGE_TRACKING_COPY_1 =
  'Please consider giving tracespace permission to collect anonymous usage data as you use this app.'
const USAGE_TRACKING_COPY_2 =
  'The tracespace project is open-source and developed by volunteers. Usage data is an important tool to help us decide where to focus our energy and measure how well the app is performing.'
const MORE_INFORMATION_COPY =
  'This data will never be shared or sold. For more information, a full list of the data collected, and instructions on how to request your data please see our'
const PRIVACY_POLICY_COPY = 'Privacy Policy'
const USAGE_TRACKING_LABEL_COPY = 'opt-in to anonymous usage tracking'
const BUTTON_COPY = 'done'

const TOAST_STYLE =
  'fixed z-999 absolute--fill w-100 flex items-center justify-center bg-black-50'
const CONTAINER_STYLE = 'relative pv3 ph4 br3 near-black bg-white shadow'
const TITLE_STYLE = 'normal mt3 mb2 f4 lh-title tc'
const COPY_STYLE = 'lh-copy mv3 measure-wide'
const OPT_IN_STYLE = 'justify-center'
const LINK_STYLE = 'link blue dim'
const BUTTON_STYLE = 'mt3 ph4 pv2 f5 bg-near-black white tc fr'

export default function AnalyticsOptInToast(): JSX.Element {
  const {appPreferences, dispatch} = useAppState()
  const [show, setShow] = useState(false)

  useTimeout(
    () => setShow(true),
    appPreferences.analyticsOptIn == null ? 1000 : null
  )

  return (
    <Fade in={show && appPreferences.analyticsOptIn == null}>
      <Formik
        initialValues={{analyticsOptIn: true}}
        onSubmit={values => dispatch(updateAppPreferences(values))}
      >
        {() => (
          <Form className={TOAST_STYLE}>
            <div className={CONTAINER_STYLE}>
              <h3 className={TITLE_STYLE}>{TITLE_COPY}</h3>
              <p className={COPY_STYLE}>{USAGE_TRACKING_COPY_1}</p>
              <Field name="analyticsOptIn">
                {(fieldProps: FieldProps<AppPreferences>) => (
                  <Checkbox className={OPT_IN_STYLE} {...fieldProps.field}>
                    {USAGE_TRACKING_LABEL_COPY}
                  </Checkbox>
                )}
              </Field>
              <p className={COPY_STYLE}>{USAGE_TRACKING_COPY_2}</p>
              <p className={COPY_STYLE}>
                <span>{MORE_INFORMATION_COPY} </span>
                <a
                  className={LINK_STYLE}
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {PRIVACY_POLICY_COPY}
                </a>
                <span>.</span>
              </p>
              <Button className={BUTTON_STYLE} type="submit">
                {BUTTON_COPY}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Fade>
  )
}
