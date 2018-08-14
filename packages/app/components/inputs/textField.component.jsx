// @flow

import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

import type { FieldProps } from 'redux-form/lib/FieldProps.types.js.flow';

type TextFieldProps = FieldProps & {
  className: String,
  label: String,
  helperText: ?String,
  fullWidth: Boolean,
};

const TextField = ({ className, input, meta, label, helperText, fullWidth, ...inputProps }: TextFieldProps) => (
  <FormControl className={className} error={!!meta.error} fullWidth={fullWidth}>
    <InputLabel htmlFor={input.name}>{label}</InputLabel>
    <Input {...input} {...inputProps} />
    <FormHelperText>{meta.error || helperText}</FormHelperText>
  </FormControl>
);

export default TextField;