import React, { useState } from 'react';
import { translations } from './Translations';
import { CreditCard, Shield, Mail, Phone, Calendar, Lock, Check, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface BillingModalProps {
  lang: 'en' | 'hi';
  userEmail: string;
  onClose: () => void;
  onPaymentSuccess: (updatedUser: any) => void;
}

export default function BillingModal({ lang, userEmail, onClose, onPaymentSuccess }: BillingModalProps) {
  const t = translations[lang];
  const [activePlan, setActivePlan] = useState<'subscriber-pro' | 'subscriber-elite' | 'pay-as-you-go'>('subscriber-pro');
  const [gateway, setGateway] = useState<'card' | 'paypal' | 'upi'>('card');
  
  // Checkout Fields state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  const [paypalEmail, setPaypalEmail] = useState(userEmail);
  const [upiMobile, setUpiMobile] = useState('');

  // Flows flags
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const plans = [
    {
      id: "subscriber-pro" as const,
      name: t.proLabel,
      price: t.proPrice,
      amount: 19,
      features: t.proFeatures,
      badge: "Popular"
    },
    {
      id: "subscriber-elite" as const,
      name: t.eliteLabel,
      price: t.elitePrice,
      amount: 49,
      features: t.eliteFeatures,
      badge: "Best Value"
    },
    {
      id: "pay-as-you-go" as const,
      name: t.paygLabel,
      price: t.paygPrice,
      amount: 9,
      features: t.paygFeatures,
      badge: "Flexible"
    }
  ];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (gateway === 'card' && (!cardNumber || !cardCvc || !cardExp)) {
      return setError("Please fill in card detail fields.");
    } else if (gateway === 'paypal' && !paypalEmail) {
      return setError("Please input a valid PayPal email identifier.");
    } else if (gateway === 'upi' && !upiMobile) {
      return setError("Please provide verified UPI mobile identifier.");
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          itemType: activePlan,
          paymentDetails: {
            gateway,
            cardName,
            upiMobile,
            paypalEmail
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess(data.user);
          onClose();
        }, 1800);
      } else {
        setError(data.error || "Gateway verification failed.");
      }
    } catch (err) {
      setError("Payment system fallback simulation active: Error processing transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === activePlan)!;

  return (
    <div id="billing-modal-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div id="billing-modal" className="bg-brand-gray border border-white/10 rounded-2xl max-w-4xl w-full p-6 relative shadow-2xl space-y-6 my-8">
        
        {/* Close Button */}
        <button 
          id="close-billing-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-lg transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-brand-green font-mono text-[9px] uppercase tracking-widest bg-brand-green/10 border border-brand-green/20 px-2.5 py-0.5 rounded-full mb-2.5 inline-block">
            Secure Credits billing
          </span>
          <h2 className="font-sans font-black text-xl text-white uppercase tracking-wider">
            {t.pricingHeader}
          </h2>
          <p className="text-white/40 text-[11px] leading-relaxed mt-1 font-sans">
            {t.pricingSub}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-xs flex items-start gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-8 text-center bg-brand-green/10 border border-brand-green/20 rounded-xl max-w-md mx-auto space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-brand-green mx-auto animate-bounce" />
            <h3 className="font-sans font-black text-lg text-white uppercase tracking-wider">{t.paymentSuccess.split('.')[0]}.</h3>
            <p className="text-[10px] text-brand-green font-mono leading-relaxed uppercase tracking-widest">{t.paymentSuccess.split('.')[1] || "Subscription verified."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Step 1: Select Plan */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(p => (
                <button
                  id={`plan-card-btn-${p.id}`}
                  key={p.id}
                  onClick={() => setActivePlan(p.id)}
                  className={`p-4 rounded-xl border text-left transition-all h-full flex flex-col justify-between relative truncate cursor-pointer ${
                    activePlan === p.id 
                      ? 'border-brand-green bg-brand-green/5 shadow-[0_0_15px_rgba(0,255,102,0.1)]' 
                      : 'border-white/5 bg-black hover:border-white/20'
                  }`}
                >
                  {p.badge && (
                    <span className="absolute top-3 right-3 text-[8px] font-mono tracking-wider bg-brand-green font-extrabold text-black px-1.5 py-0.5 rounded uppercase">
                      {p.badge}
                    </span>
                  )}
                  <div>
                    <h4 className="font-sans font-black text-[11px] text-white uppercase tracking-wider">{p.name}</h4>
                    <p className="text-brand-green font-mono text-sm font-bold mt-1 tracking-tight">{p.price}</p>
                    <ul className="mt-3.5 space-y-1.5 border-t border-white/5 pt-3.5">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/60">
                          <Check className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      activePlan === p.id ? 'border-brand-green' : 'border-white/20'
                    }`}>
                      {activePlan === p.id && <div className="w-2 h-2 bg-brand-green rounded-full" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Step 2: Payment Details Form */}
            <div className="lg:col-span-12 border-t border-white/10 pt-6">
              <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Method selector */}
                <div className="md:col-span-4 space-y-3.5">
                  <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block font-bold">{t.selectGateway}</span>
                  
                  <button
                    id="gateway-stripe-btn"
                    type="button"
                    onClick={() => { setGateway('card'); setError(''); }}
                    className={`w-full p-3.5 rounded border text-left flex items-center gap-3 transition-colors text-xs uppercase cursor-pointer ${
                      gateway === 'card' ? 'border-brand-green bg-brand-green/10 text-brand-green font-extrabold' : 'border-white/5 bg-black text-white/60 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" /> Stripe Credit Card
                  </button>

                  <button
                    id="gateway-paypal-btn"
                    type="button"
                    onClick={() => { setGateway('paypal'); setError(''); }}
                    className={`w-full p-3.5 rounded border text-left flex items-center gap-3 transition-colors text-xs uppercase cursor-pointer ${
                      gateway === 'paypal' ? 'border-brand-green bg-brand-green/10 text-brand-green font-extrabold' : 'border-white/5 bg-black text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Mail className="w-4 h-4 shrink-0" /> PayPal Wallet Connect
                  </button>

                  <button
                    id="gateway-upi-btn"
                    type="button"
                    onClick={() => { setGateway('upi'); setError(''); }}
                    className={`w-full p-3.5 rounded border text-left flex items-center gap-3 transition-colors text-xs uppercase cursor-pointer ${
                      gateway === 'upi' ? 'border-brand-green bg-brand-green/10 text-brand-green font-extrabold' : 'border-white/5 bg-black text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Phone className="w-4 h-4 shrink-0" /> Google Pay / PhonePe UPI
                  </button>
                </div>

                {/* Gateway Inputs */}
                <div className="md:col-span-8 bg-black/40 border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-white text-[11px] font-mono tracking-widest uppercase border-b border-white/5 pb-2">
                    <Shield className="w-3.5 h-3.5 text-brand-green" /> {t.paymentGatewayTitle}
                  </div>
                  
                  {gateway === 'card' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">{t.cardHolder}</label>
                          <input 
                            id="checkout-card-name"
                            type="text"
                            placeholder="Aman Sharma"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-brand-green"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">{t.cardNumber}</label>
                          <input 
                            id="checkout-card-num"
                            type="text"
                            placeholder="•••• •••• •••• ••••"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-brand-green font-mono tracking-wider"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">{t.expDate}</label>
                          <input 
                            id="checkout-card-exp"
                            type="text"
                            placeholder="MM/YY"
                            value={cardExp}
                            onChange={e => setCardExp(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-brand-green font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">{t.cvc}</label>
                          <input 
                            id="checkout-card-cvc"
                            type="text"
                            placeholder="CVC"
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-brand-green font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {gateway === 'paypal' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">{t.paypalEmail}</label>
                        <input 
                          id="checkout-paypal-email"
                          type="email"
                          placeholder="paypal-id@viraclip.ai"
                          value={paypalEmail}
                          onChange={e => setPaypalEmail(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-brand-green font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {gateway === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">{t.mobileNumber}</label>
                        <input 
                          id="checkout-upi-mobile"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={upiMobile}
                          onChange={e => setUpiMobile(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-brand-green font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-white/40 leading-relaxed font-sans mt-2">
                    {t.paymentSimulateHint}
                  </p>

                  <button
                    id="gateway-submit-checkout-btn"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-brand-green text-black hover:bg-white font-black text-xs uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> 
                        {t.btnPaySecurely} {selectedPlan.amount})
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
