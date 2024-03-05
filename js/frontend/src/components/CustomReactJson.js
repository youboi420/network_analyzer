import React from 'react'
import ReactJson from 'react-json-view'
import { JsonView, allExpanded, collapseAllNested, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

const CustomReactJson = ( {src = {}} ) => {
  return (
    // <ReactJson src={src} theme={'summerfruit:inverted'} iconStyle='square' style={10}/>
    <JsonView data={src} shouldExpandNode={collapseAllNested} style={defaultStyles}  />

  )
}

export default CustomReactJson