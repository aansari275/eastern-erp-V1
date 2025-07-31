# CreateRugForm Component

A comprehensive React component for creating rug samples in the Eastern ERP system. Built with TypeScript, Tailwind CSS, and Firebase Firestore integration.

## Features

### 🏗️ **Comprehensive Form Fields**
- **Article Number**: Unique identifier with validation
- **Buyer Code**: Customer/buyer identification
- **Construction Type**: Dropdown with predefined options (Hand Knotted, Nepali, Punja, etc.)
- **Design Name**: Custom design identification
- **Color Selection**: Visual color palette with predefined rug colors
- **Size Selection**: Standard sizes with custom size input support
- **Material Selection**: Various material options
- **Status Management**: Draft, Active, Inactive, Archived
- **Description**: Detailed text description
- **Image Upload**: Multiple image support with Firebase storage

### 🎨 **User Experience**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Validation**: Immediate feedback on form errors
- **Visual Color Picker**: Interactive color palette selection
- **Image Preview**: Upload and preview multiple images
- **Loading States**: Clear feedback during form submission
- **Toast Notifications**: Success and error messages
- **Form Reset**: Clear all fields functionality

### 🔥 **Firebase Integration**
- **Firestore Database**: Automatic data persistence
- **Authentication**: User-based data creation
- **Image Storage**: Firebase Storage for image uploads
- **Timestamps**: Automatic creation and update timestamps

## Installation & Setup

### Prerequisites
Ensure you have the following dependencies installed:

```bash
npm install firebase react lucide-react
npm install @radix-ui/react-select @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
```

### Required Files
Make sure these files exist in your project:

1. **Firebase Configuration**: `/client/src/config/firebase.ts`
2. **Authentication Provider**: `/client/src/components/AuthProvider.tsx`
3. **Toast Hook**: `/client/src/hooks/use-toast.ts`
4. **Rug Types**: `/client/src/types/rug.js`
5. **UI Components**: All components in `/client/src/components/ui/`
6. **MultiImageUpload**: `/client/src/components/MultiImageUpload.tsx`

## Usage

### Basic Usage

```tsx
import CreateRugForm from './components/CreateRugForm';

function MyComponent() {
  const handleSuccess = (rugId: string) => {
    console.log('Rug created with ID:', rugId);
    // Navigate to success page or show confirmation
  };

  return (
    <CreateRugForm 
      onSuccess={handleSuccess}
    />
  );
}
```

### With Cancel Handler

```tsx
import CreateRugForm from './components/CreateRugForm';

function MyComponent() {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = (rugId: string) => {
    console.log('Rug created:', rugId);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <>
      {showForm ? (
        <CreateRugForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <button onClick={() => setShowForm(true)}>
          Create New Rug
        </button>
      )}
    </>
  );
}
```

### In Sampling Page (Current Implementation)

```tsx
// In SamplingPage.tsx
<TabsContent value="create-rug" className="space-y-6">
  <CreateRugForm 
    onSuccess={(rugId) => {
      console.log('Rug created successfully with ID:', rugId);
      // Optionally navigate to rug gallery
    }}
  />
</TabsContent>
```

## Component Props

```tsx
interface CreateRugFormProps {
  onSuccess?: (rugId: string) => void;  // Called when rug is successfully created
  onCancel?: () => void;                // Called when user cancels form
  className?: string;                   // Additional CSS classes
}
```

## Form Fields

### Required Fields
- **Article Number**: Must be unique and at least 3 characters
- **Buyer Code**: Customer identification
- **Construction**: Select from predefined options
- **Design Name**: Custom design name
- **Colour**: Select from color palette
- **Size**: Standard size or custom format (e.g., "8x10")
- **Material**: Select from material options

### Optional Fields
- **Description**: Detailed description and notes
- **Status**: Defaults to "Draft"
- **Images**: Up to 10 images

## Data Structure

The component saves the following data structure to Firestore:

```typescript
{
  articleNumber: string;
  buyerCode: string;
  construction: string;
  designName: string;
  colour: string;
  size: string;
  material: string;
  description: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Archived';
  images: string[];
  createdBy: string;           // User UID
  createdByEmail: string;      // User email
  createdByName: string;       // User display name
  createdAt: Timestamp;        // Firebase server timestamp
  updatedAt: Timestamp;        // Firebase server timestamp
}
```

## Styling

The component uses Tailwind CSS classes and is fully responsive:

- **Mobile First**: Optimized for mobile devices
- **Responsive Grid**: Adapts to different screen sizes
- **Consistent Spacing**: Uses Tailwind's spacing system
- **Color Palette**: Professional ERP styling
- **Focus States**: Proper keyboard navigation support

## Error Handling

### Form Validation
- Real-time validation on input change
- Clear error messages for each field
- Visual indicators for invalid fields

### Firebase Errors
- Network error handling
- Authentication error handling
- Toast notifications for errors

### User Feedback
- Loading states during submission
- Success confirmation messages
- Error recovery guidance

## Accessibility

The component follows WCAG 2.1 AA standards:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets accessibility contrast requirements
- **Alternative Text**: Images have proper alt text

## Customization

### Color Palette
Modify colors in `/client/src/types/rug.js`:

```javascript
export const COLOR_PALETTE = [
  { name: 'Custom Color', hex: '#FF5733' },
  // Add more colors...
];
```

### Construction Options
Modify construction types in `/client/src/types/rug.js`:

```javascript
export const CONSTRUCTION_OPTIONS = [
  'Hand Knotted',
  'Your Custom Type',
  // Add more options...
];
```

### Styling
Add custom styles via the `className` prop or modify the Tailwind classes directly in the component.

## Integration with Existing ERP

The component is designed to integrate seamlessly with the Eastern ERP system:

1. **Authentication**: Uses existing AuthProvider
2. **UI Components**: Uses shared UI component library
3. **Firebase**: Uses existing Firebase configuration
4. **Toast System**: Uses existing toast notification system
5. **Navigation**: Compatible with wouter routing

## Testing

### Manual Testing
1. Fill out all required fields
2. Test validation by leaving fields empty
3. Upload multiple images
4. Test color palette selection
5. Test form reset functionality
6. Test submit and cancel flows

### Automated Testing
Consider adding tests for:
- Form validation logic
- Firebase integration
- Image upload functionality
- User authentication flows

## Support & Maintenance

### Common Issues
1. **Images not uploading**: Check Firebase Storage configuration
2. **Form not submitting**: Verify user authentication
3. **Validation errors**: Check field requirements
4. **Styling issues**: Verify Tailwind CSS setup

### Updates
The component is designed to be easily maintainable:
- Modular structure with clear separation of concerns
- TypeScript for type safety
- Comprehensive error handling
- Well-documented code

---

For questions or issues, please refer to the development team or check the Firebase console for data persistence verification.