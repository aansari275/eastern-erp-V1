import React, { useState, useCallback } from 'react';
import { useForm, Controller, FieldValues, Path, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from '../ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'datetime'
  | 'file'
  | 'custom';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: z.ZodType<any>;
  options?: Array<{ label: string; value: string | number; disabled?: boolean }>;
  multiple?: boolean;
  accept?: string; // For file inputs
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // For textarea
  className?: string;
  section?: string;
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  customRender?: (field: any, form: any) => React.ReactNode;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormBuilderConfig {
  title: string;
  description?: string;
  schema: z.ZodType<any>;
  fields: FormFieldConfig[];
  sections?: FormSection[];
  submitLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  tabs?: Array<{ id: string; label: string; sections: string[] }>;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  className?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

interface FormBuilderProps extends FormBuilderConfig {}

const FormBuilder: React.FC<FormBuilderProps> = ({
  title,
  description,
  schema,
  fields,
  sections = [],
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loadingLabel = 'Saving...',
  tabs,
  onSubmit,
  onCancel,
  defaultValues = {},
  className = '',
  autoSave = false,
  autoSaveInterval = 30000, // 30 seconds
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({
      ...acc,
      [section.id]: section.defaultCollapsed || false
    }), {})
  );
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, control, watch, formState: { errors, isDirty, isValid } } = form;

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !isDirty) return;

    const timer = setTimeout(async () => {
      try {
        const data = form.getValues();
        // You can implement auto-save logic here
        // For example, save to localStorage or send to API
        localStorage.setItem(`form-autosave-${title}`, JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [watch(), autoSave, autoSaveInterval, isDirty, form, title]);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      // Clear auto-save data on successful submit
      localStorage.removeItem(`form-autosave-${title}`);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const shouldShowField = useCallback((field: FormFieldConfig) => {
    if (!field.conditional) return true;
    
    const { field: conditionField, value: conditionValue, operator = 'equals' } = field.conditional;
    const watchedValue = watch(conditionField);
    
    switch (operator) {
      case 'equals':
        return watchedValue === conditionValue;
      case 'not_equals':
        return watchedValue !== conditionValue;
      case 'contains':
        return Array.isArray(watchedValue) && watchedValue.includes(conditionValue);
      case 'greater_than':
        return Number(watchedValue) > Number(conditionValue);
      case 'less_than':
        return Number(watchedValue) < Number(conditionValue);
      default:
        return true;
    }
  }, [watch]);

  const renderField = (field: FormFieldConfig) => {
    if (!shouldShowField(field)) return null;

    return (
      <FormField
        key={field.name}
        control={control}
        name={field.name as Path<FieldValues>}
        render={({ field: formField, fieldState }) => (
          <FormItem className={field.className}>
            <FormLabel className="flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
              {fieldState.error && <AlertCircle className="h-3 w-3 text-red-500" />}
              {!fieldState.error && formField.value && field.required && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </FormLabel>
            
            <FormControl>
              {field.customRender ? (
                field.customRender(formField, form)
              ) : (
                <>
                  {field.type === 'text' && (
                    <Input
                      {...formField}
                      placeholder={field.placeholder}
                      disabled={field.disabled || isSubmitting}
                      maxLength={field.maxLength}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {field.type === 'email' && (
                    <Input
                      {...formField}
                      type="email"
                      placeholder={field.placeholder}
                      disabled={field.disabled || isSubmitting}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {field.type === 'password' && (
                    <div className="relative">
                      <Input
                        {...formField}
                        type={showPasswords[field.name] ? 'text' : 'password'}
                        placeholder={field.placeholder}
                        disabled={field.disabled || isSubmitting}
                        className={fieldState.error ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility(field.name)}
                        disabled={field.disabled || isSubmitting}
                      >
                        {showPasswords[field.name] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      {...formField}
                      type="number"
                      placeholder={field.placeholder}
                      disabled={field.disabled || isSubmitting}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      className={fieldState.error ? 'border-red-500' : ''}
                      onChange={(e) => formField.onChange(e.target.valueAsNumber || 0)}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <Textarea
                      {...formField}
                      placeholder={field.placeholder}
                      disabled={field.disabled || isSubmitting}
                      rows={field.rows || 4}
                      maxLength={field.maxLength}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select
                      onValueChange={formField.onChange}
                      value={formField.value}
                      disabled={field.disabled || isSubmitting}
                    >
                      <SelectTrigger className={fieldState.error ? 'border-red-500' : ''}>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                            disabled={option.disabled}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {field.type === 'date' && (
                    <Input
                      {...formField}
                      type="date"
                      disabled={field.disabled || isSubmitting}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {field.type === 'datetime' && (
                    <Input
                      {...formField}
                      type="datetime-local"
                      disabled={field.disabled || isSubmitting}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                  )}
                  
                  {field.type === 'file' && (
                    <Input
                      type="file"
                      accept={field.accept}
                      multiple={field.multiple}
                      disabled={field.disabled || isSubmitting}
                      className={fieldState.error ? 'border-red-500' : ''}
                      onChange={(e) => {
                        const files = e.target.files;
                        formField.onChange(field.multiple ? files : files?.[0]);
                      }}
                    />
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={field.name}
                        checked={formField.value || false}
                        onChange={(e) => formField.onChange(e.target.checked)}
                        disabled={field.disabled || isSubmitting}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        {field.label}
                      </label>
                    </div>
                  )}
                  
                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`${field.name}-${option.value}`}
                            name={field.name}
                            value={option.value}
                            checked={formField.value === option.value}
                            onChange={(e) => formField.onChange(e.target.value)}
                            disabled={option.disabled || field.disabled || isSubmitting}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <label
                            htmlFor={`${field.name}-${option.value}`}
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'multiselect' && (
                    <Select
                      onValueChange={(value) => {
                        const currentValues = formField.value || [];
                        const newValues = currentValues.includes(value)
                          ? currentValues.filter((v: any) => v !== value)
                          : [...currentValues, value];
                        formField.onChange(newValues);
                      }}
                      disabled={field.disabled || isSubmitting}
                    >
                      <SelectTrigger className={fieldState.error ? 'border-red-500' : ''}>
                        <SelectValue 
                          placeholder={
                            formField.value?.length > 0 
                              ? `${formField.value.length} selected` 
                              : field.placeholder
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                            disabled={option.disabled}
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formField.value?.includes(option.value) || false}
                                onChange={() => {}}  // Handled by parent onValueChange
                                className="w-4 h-4"
                              />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </FormControl>
            
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const sectionFields = fields.filter(f => f.section === sectionId);
    
    if (sectionFields.length === 0) return null;

    const content = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionFields.map(renderField)}
      </div>
    );

    if (!section) return content;

    return (
      <Card key={sectionId} className="mb-6">
        <CardHeader 
          className={section.collapsible ? 'cursor-pointer' : ''}
          onClick={section.collapsible ? () => toggleSectionCollapse(sectionId) : undefined}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </div>
            {section.collapsible && (
              <Button variant="ghost" size="sm">
                {collapsedSections[sectionId] ? <Plus className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        {!collapsedSections[sectionId] && (
          <CardContent className="pt-0">
            {content}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderFormContent = () => {
    if (tabs && tabs.length > 0) {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              {tab.sections.map(renderSection)}
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    // Group fields by section
    const sectionsToRender = sections.length > 0 
      ? sections.map(s => s.id)
      : ['default'];
    
    const fieldsWithoutSection = fields.filter(f => !f.section);
    
    return (
      <div className="space-y-6">
        {sectionsToRender.map(renderSection)}
        {fieldsWithoutSection.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldsWithoutSection.map(renderField)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {autoSave && lastSaved && (
              <Badge variant="outline" className="text-xs">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
              {renderFormContent()}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {loadingLabel}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {submitLabel}
                    </div>
                  )}
                </Button>
                
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {cancelLabel}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormBuilder;