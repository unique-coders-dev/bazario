'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

// Types
interface Product {
  id: string;
  name: string;
  nameBn: string | null;
  description: string | null;
  descriptionBn: string | null;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  categoryId: string;
  category: { id: string; name: string; nameBn: string | null };
  isActive: boolean;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  nameBn: string | null;
  icon: string | null;
}

interface DeliveryTimeSlots {
  morning: string
  evening: string
}

interface SiteSettings {
  siteName: string;
  logo: string;
  themeColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  searchPlaceholder: string;
  filterBackgroundImage: string | null;
  minOrderAmount: number;
  deliveryFeeUnder200: number;
  deliveryFeeUnder500: number;
  deliveryFeeUnder1000: number;
  deliveryFeeAbove1000: number;
  deliveryTimeSlots: DeliveryTimeSlots;
  merchantNumber: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CustomerInfo {
  name: string;
  whatsapp: string;
  address: string;
}

interface OrderHistory {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customer: CustomerInfo;
  transactionId: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'delivered';
}

// Fallback image for when product images fail to load
const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23e8f5e9" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%235ca855" font-size="40"%3E%F0%9F%8D%89%3C/text%3E%3C/svg%3E';

// Product Card Component with accessibility
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Discount Tag - only show if originalPrice > 0 AND discount > 0 */}
      <div className="relative">
        <img
          src={imgError ? fallbackImage : product.image}
          alt={product.name}
          className="w-full h-36 object-cover"
          onError={() => setImgError(true)}
        />
        {product.originalPrice > 0 && product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-0.5 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.description || ''}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600 font-bold">{product.price}tk</span>
          {product.originalPrice > 0 && product.originalPrice > product.price && (
            <span className="text-gray-400 text-xs line-through">{product.originalPrice}tk</span>
          )}
        </div>
        <button
          onClick={() => onAddToCart(product)}
          className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(1000);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', whatsapp: '', address: '' });
  const [transactionId, setTransactionId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<OrderHistory | null>(null);
  const [searchedOrders, setSearchedOrders] = useState<OrderHistory[]>([]);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [searchMode, setSearchMode] = useState<'order' | 'whatsapp'>('order');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch products, categories and settings from API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/products');
        if (res.ok) {
          const data = await res.json();
          // Transform products to ensure categoryId is properly set
          const transformedProducts = (data.products || []).map((p: any) => ({
            ...p,
            // Use category_id if available, or extract from nested categories array
            categoryId: p.category_id || (p.categories?.[0]?.id) || p.category?.id || '',
            // Normalize category data
            category: p.categories?.[0]?.name ? {
              id: p.categories[0].id,
              name: p.categories[0].name,
              nameBn: p.categories[0].name_bn
            } : p.category || { id: '', name: '', nameBn: null }
          }));
          setAllProducts(transformedProducts);
          setCategories(data.categories || []);
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, []);

  // Toggle order expansion
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bazario-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage');
      }
    }
  }, []);

  // Load customer info from localStorage whenever checkout modal opens
  useEffect(() => {
    if (showCheckout) {
      const savedCustomer = localStorage.getItem('bazario-customer');
      if (savedCustomer) {
        try {
          const parsed = JSON.parse(savedCustomer);
          // Only autofill if current state is empty
          setCustomerInfo(prev => ({
            name: prev.name || parsed.name || '',
            whatsapp: prev.whatsapp || parsed.whatsapp || '',
            address: prev.address || parsed.address || ''
          }));
        } catch (e) {
          console.error('Failed to parse customer from localStorage');
        }
      }
    }
  }, [showCheckout]);

  // Load order history from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('bazario-orders');
    if (savedOrders) {
      try {
        setOrderHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse order history from localStorage');
      }
    }
  }, []);

  // Save order history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bazario-orders', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bazario-cart', JSON.stringify(cart));
  }, [cart]);

  // Check if this is first visit - show delivery popup
  useEffect(() => {
    const hasSeenDeliveryPopup = localStorage.getItem('bazario-delivery-popup-seen');
    if (!hasSeenDeliveryPopup && settings) {
      // Small delay to let the page load first
      setTimeout(() => setShowDeliveryPopup(true), 500);
    }
  }, [settings]);

  // Close delivery popup and save to localStorage
  const handleCloseDeliveryPopup = () => {
    setShowDeliveryPopup(false);
    localStorage.setItem('bazario-delivery-popup-seen', 'true');
  };

  // Filter products using useMemo for performance
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (product.nameBn && product.nameBn.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
      const matchesPrice = product.price <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, activeCategory, priceRange, allProducts]);

  // Reset displayed count when category changes
  useEffect(() => {
    setDisplayedCount(12);
  }, [activeCategory, searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && displayedCount < allProducts.length) {
        setLoading(true);
        setTimeout(() => {
          setDisplayedCount(prev => Math.min(prev + 6, allProducts.length));
          setLoading(false);
        }, 500);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loading, displayedCount]);

  // Add to cart
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculate delivery fee based on tiers
  const calculateDeliveryFee = (subtotal: number): number => {
    if (subtotal === 0) return 0;
    if (subtotal < 200) return settings?.deliveryFeeUnder200 ?? 20;
    if (subtotal < 500) return settings?.deliveryFeeUnder500 ?? 30;
    if (subtotal < 1000) return settings?.deliveryFeeUnder1000 ?? 40;
    return settings?.deliveryFeeAbove1000 ?? 50;
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const minOrderAmount = settings?.minOrderAmount ?? 100;

  // Check if minimum order is met
  const canCheckout = subtotal >= minOrderAmount && customerInfo.name && customerInfo.whatsapp && customerInfo.address && transactionId;
  const remainingForFreeDelivery = minOrderAmount - subtotal;

  const [placingOrder, setPlacingOrder] = useState(false);

  // Handle checkout - submit order to API
  const handleCheckout = async () => {
    if (customerInfo.name && customerInfo.whatsapp && customerInfo.address && transactionId) {
      setPlacingOrder(true);
      try {
        const items = cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }));

        const res = await fetch('/api/public/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerInfo.name,
            whatsapp: customerInfo.whatsapp,
            address: customerInfo.address,
            transactionId,
            items
          })
        });

        if (res.ok) {
          const data = await res.json();
          // Also save to local storage for display
          const newOrder: OrderHistory = {
            id: data.order?.orderNumber || 'ORD-' + Date.now(),
            items: [...cart],
            subtotal,
            deliveryFee,
            total,
            customer: { ...customerInfo },
            transactionId,
            orderDate: new Date().toISOString(),
            status: 'pending',
          };
          setOrderHistory(prev => [newOrder, ...prev]);
          // Always save/update customer info to localStorage for next time
          const customerData = {
            name: customerInfo.name,
            whatsapp: customerInfo.whatsapp,
            address: customerInfo.address
          };
          localStorage.setItem('bazario-customer', JSON.stringify(customerData));
          // Update state with the saved data immediately
          setCustomerInfo(customerData);
          setOrderPlaced(true);
          setCart([]);
          setShowCheckout(false);
          setShowCart(false);
          setCustomerInfo({ name: '', whatsapp: '', address: '' });
          setTransactionId('');
        } else {
          alert('Failed to place order. Please try again.');
        }
      } catch (error) {
        console.error('Order error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setPlacingOrder(false);
      }
    }
  };

  // Map database order to OrderHistory format
  const mapDbOrderToHistory = (dbOrder: any): OrderHistory => ({
    id: dbOrder.order_number,
    items: (dbOrder.items || []).map((item: any) => ({
      id: item.product_id,
      name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      image: '',
      categoryId: '',
      category: { id: '', name: '', nameBn: null },
      nameBn: null,
      description: null,
      descriptionBn: null,
      originalPrice: item.price,
      discount: 0,
      isActive: true,
      isFeatured: false
    })),
    subtotal: dbOrder.subtotal,
    deliveryFee: dbOrder.delivery_fee,
    total: dbOrder.total,
    customer: {
      name: dbOrder.customer_name,
      whatsapp: dbOrder.whatsapp,
      address: dbOrder.address
    },
    transactionId: dbOrder.transaction_id || '',
    orderDate: dbOrder.created_at,
    status: (dbOrder.status || 'PENDING').toLowerCase() as 'pending' | 'confirmed' | 'delivered'
  });

  // Search for order by tracking number or WhatsApp - queries database
  const handleOrderSearch = async () => {
    if (!trackingNumber.trim()) return;
    setSearchingOrder(true);
    setSearchedOrder(null);
    setSearchedOrders([]);
    
    try {
      let url = '';
      if (searchMode === 'order') {
        url = `/api/public/orders?orderNumber=${encodeURIComponent(trackingNumber.trim())}`;
      } else {
        url = `/api/public/orders?whatsapp=${encodeURIComponent(trackingNumber.trim())}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        if (searchMode === 'order' && data.order) {
          // Single order search
          setSearchedOrder(mapDbOrderToHistory(data.order));
        } else if (searchMode === 'whatsapp' && data.orders) {
          // Multiple orders for WhatsApp search
          setSearchedOrders(data.orders.map(mapDbOrderToHistory));
        }
      } else {
        setSearchedOrder(null);
        setSearchedOrders([]);
      }
    } catch (error) {
      console.error('Order search error:', error);
      setSearchedOrder(null);
      setSearchedOrders([]);
    } finally {
      setSearchingOrder(false);
    }
  };

  // Handle Enter key in tracking input
  const handleTrackingKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOrderSearch();
    }
  };

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 shadow-lg" 
        style={{padding: '12px 16px', backgroundColor: settings?.themeColor || '#1B5E20'}}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <img 
              src={settings?.logo || 'https://cdn-icons-png.flaticon.com/512/10437/10437361.png'} 
              alt={settings?.siteName || 'Bazario Logo'} 
              className="h-10 w-auto"
            />

          {/* Right side buttons - Cart first, then Order History */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2.5 rounded-full transition-colors"
              style={{backgroundColor: 'rgba(255,255,255,0.2)'}}
              aria-label={`Open cart with ${cart.reduce((sum, item) => sum + item.quantity, 0)} items`}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Order Tracking Button */}
            <button
              onClick={() => setShowOrderTracking(true)}
              className="relative p-2.5 rounded-full transition-colors"
              style={{backgroundColor: 'rgba(255,255,255,0.2)'}}
              aria-label="Track order"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {initialLoading && (
        <div className="flex items-center justify-center h-screen mt-[70px]">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!initialLoading && (
        <>
      {/* Hero Section */}
      <section className="relative h-56 mt-[70px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${settings?.heroBackgroundImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop'})` }}
          role="img"
          aria-label="Fresh groceries background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-600/60" />
        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-center items-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">{settings?.heroTitle || 'Fresh Groceries Delivered'}</h2>
          <p className="text-green-100 text-sm md:text-base mb-4 text-center">{settings?.heroSubtitle || 'Quality products at your doorstep'}</p>
          <div className="w-full max-w-md relative">
            <input
              type="text"
              placeholder={settings?.searchPlaceholder || 'Search for vegetables, fish, rice...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pr-12 rounded-full text-gray-800 shadow-lg focus:ring-2 focus:ring-green-400 bg-white"
              aria-label="Search for products"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors" aria-label="Search">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>



      {/* Delivery Info Popup - Shows on first visit */}
      {showDeliveryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Delivery information">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseDeliveryPopup} />
          <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="bg-green-700 p-4 text-white text-center">
              <h2 className="text-xl font-bold">🚚 Delivery Information</h2>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Minimum Order */}
              <div className="bg-green-50 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Minimum Order Amount</span>
                  <span className="font-bold text-green-700 text-lg">{minOrderAmount}tk</span>
                </div>
              </div>

              {/* Delivery Fee Tiers */}
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="font-semibold text-gray-700 mb-2 text-sm">Delivery Fee:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between bg-white p-2 rounded-lg"><span className="text-gray-500">Under 200tk</span><span className="font-medium">{settings?.deliveryFeeUnder200 ?? 20}tk</span></div>
                  <div className="flex justify-between bg-white p-2 rounded-lg"><span className="text-gray-500">Under 500tk</span><span className="font-medium">{settings?.deliveryFeeUnder500 ?? 30}tk</span></div>
                  <div className="flex justify-between bg-white p-2 rounded-lg"><span className="text-gray-500">Under 1000tk</span><span className="font-medium">{settings?.deliveryFeeUnder1000 ?? 40}tk</span></div>
                  <div className="flex justify-between bg-white p-2 rounded-lg"><span className="text-gray-500">1000tk+</span><span className="font-medium">{settings?.deliveryFeeAbove1000 ?? 50}tk</span></div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="font-semibold text-gray-700 mb-2 text-sm">⏰ Delivery Time:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                    <span>🌅</span>
                    <span className="text-gray-600">Morning:</span>
                    <span className="font-medium">{settings?.deliveryTimeSlots?.morning || '6 AM - 12 PM'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                    <span>🌙</span>
                    <span className="text-gray-600">Evening:</span>
                    <span className="font-medium">{settings?.deliveryTimeSlots?.evening || '4 PM - 9 PM'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">Orders placed are delivered in the next available slot</p>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleCloseDeliveryPopup}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
              >
                Got It! ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <section className="max-w-6xl mx-auto px-4 py-4 bg-white mx-4 mt-4 rounded-2xl shadow-sm">
        {/* Categories - responsive grid, not scrollable */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* All category button */}
          <button
            key="all"
            onClick={() => { setActiveCategory('all'); }}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
            aria-pressed={activeCategory === 'all'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span>সব পণ্য</span>
          </button>
          {/* Dynamic categories from database */}
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              aria-pressed={activeCategory === cat.id}
            >
              <span>{cat.nameBn || cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-8 mt-4">
        {/* Loading indicator for filtering - only show when actually filtering */}
        {filterLoading && allProducts.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-3 border-green-600 border-t-transparent rounded-full animate-spin" aria-label="Loading products" />
          </div>
        )}
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{gap: '16px'}} role="list" aria-label="Products list">
          {filteredProducts.slice(0, displayedCount).map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="flex justify-center py-8" aria-label="Load more products">
          {loading && <div className="w-6 h-6 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />}
          {!loading && displayedCount >= allProducts.length && filteredProducts.length > 0 && (
            <p className="text-gray-400 text-sm">You've seen all products!</p>
          )}
        </div>

        {filteredProducts.length === 0 && !filterLoading && allProducts.length > 0 && (
          <div className="text-center py-12" role="status">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        )}
      </section>
        </>
      )}

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-700 text-white shadow-lg z-40" role="region" aria-label="Cart summary" style={{padding: '16px', animation: 'slideUp 0.3s ease-out'}}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-80">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                <p className="font-bold">{total}tk</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm"
              >
                Order Items
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <div className="absolute inset-0 modal-backdrop bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[80vh] overflow-hidden" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4" role="list">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl" role="listitem">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.description}</p>
                        <p className="text-green-700 font-bold">{item.price}tk</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                {subtotal < minOrderAmount && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    Minimum order amount is {minOrderAmount}tk. Add {remainingForFreeDelivery}tk more.
                  </div>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{subtotal}tk</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{deliveryFee}tk</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-700">{total}tk</span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  disabled={subtotal < minOrderAmount}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                >
                  {subtotal < minOrderAmount ? `Minimum ${minOrderAmount}tk Required` : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Checkout">
          <div className="absolute inset-0 modal-backdrop bg-black/50" onClick={() => setShowCheckout(false)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] overflow-hidden" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Confirm</h2>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close checkout">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[65vh] space-y-6">
              {/* Order Summary */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{subtotal}tk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span>{deliveryFee}tk</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-green-700 pt-2 border-t border-green-200">
                    <span>Total to Pay</span>
                    <span>{total}tk</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Delivery Details</h3>
                <div>
                  <label htmlFor="customer-name" className="block text-sm font-medium text-gray-600 mb-1">Your Name</label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp-number" className="block text-sm font-medium text-gray-600 mb-1">WhatsApp Number</label>
                  <input
                    id="whatsapp-number"
                    type="tel"
                    value={customerInfo.whatsapp}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="delivery-address" className="block text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
                  <textarea
                    id="delivery-address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Full delivery address with landmarks"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 resize-none"
                  />
                </div>
                
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Payment</h3>
                {/* Transaction ID Input First */}
                <div>
                  <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
                  <input
                    id="transaction-id"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID (e.g., TRX123456789)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                  />
                </div>
                {/* Payment Guidelines */}
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center" aria-hidden="true">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">bKash / Nagad</p>
                      <p className="text-xs text-gray-500">Send payment to verify</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-gray-500 mb-2">Payment Steps:</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Open bKash/Nagad app</li>
                      <li>
                        Send <span className="font-bold text-green-700 bg-green-100 px-1 rounded">{total}tk</span> to merchant number:
                        {settings?.merchantNumber ? (
                          <button
                            onClick={() => { navigator.clipboard.writeText(settings.merchantNumber); }}
                            className="ml-1 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            {settings.merchantNumber}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-red-500 font-semibold ml-1">Not configured</span>
                        )}
                      </li>
                      <li>Copy the transaction ID</li>
                      <li>Paste it in the field above</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleCheckout}
                disabled={!canCheckout || placingOrder}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {orderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Order placed successfully">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOrderPlaced(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl text-center" style={{padding: '32px', animation: 'scaleIn 0.3s ease-out'}}>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-6">We'll contact you via WhatsApp for confirmation.</p>
            <button
              onClick={() => setOrderPlaced(false)}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showOrderTracking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Track order">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowOrderTracking(false); setTrackingNumber(''); setSearchedOrder(null); setSearchedOrders([]); }} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[80vh] overflow-hidden" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Track Your Order</h2>
              <button onClick={() => { setShowOrderTracking(false); setTrackingNumber(''); setSearchedOrder(null); setSearchedOrders([]); }} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close tracking">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[65vh]">
              {/* Search Mode Toggle */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => { setSearchMode('order'); setSearchedOrder(null); setSearchedOrders([]); }}
                  className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                    searchMode === 'order'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📋 By Order Number
                </button>
                <button
                  onClick={() => { setSearchMode('whatsapp'); setSearchedOrder(null); setSearchedOrders([]); }}
                  className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
                    searchMode === 'whatsapp'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📱 By WhatsApp
                </button>
              </div>

              {/* Search Form */}
              <div className="mb-6">
                <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-600 mb-2">
                  {searchMode === 'order' ? 'Enter your order number' : 'Enter your WhatsApp number'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="tracking-number"
                    type={searchMode === 'whatsapp' ? 'tel' : 'text'}
                    value={trackingNumber}
                    onChange={(e) => { setTrackingNumber(e.target.value); setSearchedOrder(null); setSearchedOrders([]); }}
                    onKeyDown={handleTrackingKeyDown}
                    placeholder={searchMode === 'order' ? 'e.g., ORD-1234ABCD' : 'e.g., 01XXXXXXXXX'}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500"
                  />
                  <button
                    onClick={handleOrderSearch}
                    disabled={!trackingNumber.trim() || searchingOrder}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center gap-2"
                  >
                    {searchingOrder ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              </div>

              {/* Search Result */}
              {searchingOrder ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchedOrder ? (
                /* Single order result (by order number) */
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{searchedOrder.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(searchedOrder.orderDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      searchedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      searchedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {searchedOrder.status.charAt(0).toUpperCase() + searchedOrder.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3 pt-3 border-t border-green-200">
                    {searchedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.name} x{item.quantity}</span>
                        <span className="font-medium">{item.price * item.quantity}tk</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{searchedOrder.subtotal}tk</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span>{searchedOrder.deliveryFee}tk</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-700">
                      <span>Total</span>
                      <span>{searchedOrder.total}tk</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-gray-500">Delivery to: {searchedOrder.customer.address}</p>
                    <p className="text-xs text-gray-500">Phone: {searchedOrder.customer.whatsapp}</p>
                    <p className="text-xs text-gray-500">TRX: {searchedOrder.transactionId}</p>
                  </div>
                </div>
              ) : searchedOrders.length > 0 ? (
                /* Multiple orders result (by WhatsApp) */
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 font-medium">{searchedOrders.length} order(s) found</p>
                  {searchedOrders.map(order => (
                    <div key={order.id} className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{order.id}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3 pt-3 border-t border-green-200">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{item.name} x{item.quantity}</span>
                            <span className="font-medium">{item.price * item.quantity}tk</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-green-200 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-green-700">
                          <span>Total</span>
                          <span>{order.total}tk</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trackingNumber && !searchingOrder ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No order found with this number</p>
                  <p className="text-xs text-gray-400 mt-1">Please check your order number and try again</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Enter your order number to track your order</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Order history">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowOrderHistory(false)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[80vh] overflow-hidden" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Order History</h2>
              <button onClick={() => setShowOrderHistory(false)} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close order history">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[65vh]">
              {orderHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map(order => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-xl">
                      {/* Clickable header to toggle expansion */}
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        <div>
                          <p className="font-bold text-gray-800">{order.id}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Collapsible details */}
                      {expandedOrders.has(order.id) && (
                        <>
                          <div className="space-y-2 mb-3 mt-3 pt-3 border-t border-gray-200">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                <span className="font-medium">{item.price * item.quantity}tk</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal</span>
                              <span>{order.subtotal}tk</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Delivery</span>
                              <span>{order.deliveryFee}tk</span>
                            </div>
                            <div className="flex justify-between font-bold text-green-700">
                              <span>Total</span>
                              <span>{order.total}tk</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">Delivery to: {order.customer.address}</p>
                            <p className="text-xs text-gray-500">Phone: {order.customer.whatsapp}</p>
                            <p className="text-xs text-gray-500">TRX: {order.transactionId}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Help Button */}
      <button
        onClick={() => setShowDeliveryPopup(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-30 transition-transform hover:scale-110"
        aria-label="Delivery information"
        title="Delivery Info"
      >
        ?
      </button>
    </main>
  );
}