# React Development Rules for AI Models

## Core Philosophy
React components should be predictable transformations of data rather than complex stateful machines. Think of UIs as thin wrappers over data that clearly express business logic through code structure.

## State Management Rules

### 1. UIs are thin wrappers over data - avoid local state unless necessary

**Principle**: Local state should be independent of business logic and only used when truly reactive behavior is required.

**❌ Avoid:**
```jsx
// Unnecessary useState for derived data
function UserProfile({ user }) {
  const [displayName, setDisplayName] = useState('');
  
  useEffect(() => {
    setDisplayName(user.firstName + ' ' + user.lastName);
  }, [user]);

  return <h1>{displayName}</h1>;
}
```

**✅ Prefer:**
```jsx
// Direct calculation from props
function UserProfile({ user }) {
  const displayName = user.firstName + ' ' + user.lastName;
  return <h1>{displayName}</h1>;
}
```

### 2. Flatten UI state into basic calculations when possible

**Principle**: If you can derive it from existing data, calculate it directly instead of storing it in state.

**❌ Avoid:**
```jsx
// Complex reactive state management
function ShoppingCart({ items }) {
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(newSubtotal);
    setTax(newSubtotal * 0.08);
    setTotal(newSubtotal * 1.08);
  }, [items]);

  return <div>Total: ${total}</div>;
}
```

**✅ Prefer:**
```jsx
// Simple calculations
function ShoppingCart({ items }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return <div>Total: ${total.toFixed(2)}</div>;
}
```

### 3. Choose state machines over multiple useState hooks

**Principle**: Related state should be managed together to prevent impossible states and make transitions explicit.

**❌ Avoid:**
```jsx
// Multiple useState hooks that can get out of sync
function DataFetcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Complex state management with potential for inconsistent states
  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await api.getData();
      setData(response);
    } catch (error) {
      setHasError(true);
      setErrorMessage(error.message);
    }
    setIsLoading(false);
  };
}
```

**✅ Prefer:**
```jsx
// Single state machine with explicit states
function DataFetcher() {
  const [state, setState] = useState({ 
    status: 'idle', 
    data: null, 
    error: null 
  });

  const fetchData = async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const response = await api.getData();
      setState({ status: 'success', data: response, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: error.message });
    }
  };
}
```

## Component Structure Rules

### 4. Create component abstractions for nested conditional logic

**Principle**: When you have complex nested conditions or top-level if/else statements, extract them into separate components.

**❌ Avoid:**
```jsx
function Dashboard({ user, notifications, settings }) {
  return (
    <div>
      {user.isAdmin ? (
        <div>
          {settings.showNotifications ? (
            <div>
              {notifications.length > 0 ? (
                <NotificationList notifications={notifications} />
              ) : (
                <EmptyNotifications />
              )}
            </div>
          ) : (
            <DisabledNotifications />
          )}
        </div>
      ) : (
        <UserDashboard user={user} />
      )}
    </div>
  );
}
```

**✅ Prefer:**
```jsx
function Dashboard({ user, notifications, settings }) {
  if (!user.isAdmin) {
    return <UserDashboard user={user} />;
  }
  
  return (
    <div>
      <AdminNotifications 
        notifications={notifications} 
        showNotifications={settings.showNotifications} 
      />
    </div>
  );
}

function AdminNotifications({ notifications, showNotifications }) {
  if (!showNotifications) return <DisabledNotifications />;
  if (notifications.length === 0) return <EmptyNotifications />;
  return <NotificationList notifications={notifications} />;
}
```

### 5. Use ternaries sparingly - only for simple, readable logic

**Principle**: Ternary operators should be reserved for small, easily readable logic. Complex conditions should use if/else or separate components.

**❌ Avoid:**
```jsx
// Complex nested ternaries
function StatusBadge({ user, isOnline, hasPermissions }) {
  return (
    <span className={
      user.isPremium ? 
        (isOnline ? 
          (hasPermissions ? 'premium-online-permitted' : 'premium-online-restricted') 
          : 'premium-offline'
        ) 
        : (isOnline ? 'basic-online' : 'basic-offline')
    }>
      {user.isPremium ? 'Premium' : 'Basic'} User
    </span>
  );
}
```

**✅ Prefer:**
```jsx
// Clear, explicit logic
function StatusBadge({ user, isOnline, hasPermissions }) {
  const getStatusClass = () => {
    if (!user.isPremium) return isOnline ? 'basic-online' : 'basic-offline';
    if (!isOnline) return 'premium-offline';
    return hasPermissions ? 'premium-online-permitted' : 'premium-online-restricted';
  };

  return (
    <span className={getStatusClass()}>
      {user.isPremium ? 'Premium' : 'Basic'} User
    </span>
  );
}
```

## Effect and Logic Rules

### 6. Avoid putting dependent logic in useEffect

**Principle**: Logic that depends on other logic should be explicit and declarative, not hidden in useEffect hooks.

**❌ Avoid:**
```jsx
function OrderSummary({ items, discountCode }) {
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newSubtotal = calculateSubtotal(items);
    setSubtotal(newSubtotal);
  }, [items]);

  useEffect(() => {
    const newDiscount = calculateDiscount(subtotal, discountCode);
    setDiscount(newDiscount);
  }, [subtotal, discountCode]);

  useEffect(() => {
    setTotal(subtotal - discount);
  }, [subtotal, discount]);
}
```

**✅ Prefer:**
```jsx
function OrderSummary({ items, discountCode }) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, discountCode);
  const total = subtotal - discount;

  return (
    <div>
      <div>Subtotal: ${subtotal}</div>
      <div>Discount: ${discount}</div>
      <div>Total: ${total}</div>
    </div>
  );
}
```

### 7. Document setTimeout usage and provide clear reasoning

**Principle**: setTimeout is often a code smell. When used, always include a comment explaining why it's necessary.

**❌ Avoid:**
```jsx
function NotificationToast({ message, onClose }) {
  useEffect(() => {
    setTimeout(() => {
      onClose();
    }, 3000);
  }, [onClose]);
}
```

**✅ Prefer:**
```jsx
function NotificationToast({ message, onClose }) {
  useEffect(() => {
    // Auto-dismiss notification after 3 seconds for better UX
    // Cannot use CSS animations alone due to need for cleanup callback
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [onClose]);
}
```

## When to Break These Rules

These rules should guide your default approach, but can be broken when:

- **Performance**: Expensive calculations that truly benefit from memoization
- **External integrations**: Third-party libraries that require specific state patterns
- **User interactions**: Truly interactive state that cannot be derived (form inputs, animations)
- **Accessibility**: When explicit state management improves screen reader experience

## Summary

The goal is to write React code that is:
- **Predictable**: Easy to understand what will happen given certain inputs
- **Debuggable**: Clear data flow makes issues easy to trace
- **Maintainable**: Less state means fewer places for bugs to hide
- **Readable**: Code structure reflects business logic

Remember: Most React bugs come from state getting out of sync. The less state you manage, the fewer opportunities for bugs.