import React, { useState } from 'react'

export default function Tickets() {
  const games = {
    game1: 'Hawks vs Eagles - Saturday, Nov 2 @ 10:00 AM',
    game2: 'Raptors vs Thunder - Saturday, Nov 2 @ 12:00 PM',
    game3: 'Wildcats vs Tigers - Saturday, Nov 2 @ 2:00 PM',
    game4: 'Lions vs Bears - Sunday, Nov 3 @ 10:00 AM',
    game5: 'Phoenix vs Falcons - Sunday, Nov 3 @ 12:00 PM',
    game6: 'Dragons vs Panthers - Sunday, Nov 3 @ 2:00 PM'
  }

  const ticketTypes = {
    adult: { name: 'Adult Ticket', price: 8, emoji: '🧑', desc: 'For adults 18 years and older', info: 'Enjoy watching the exciting youth basketball action!' },
    child: { name: 'Child Ticket', price: 5, emoji: '👦', desc: 'For children 17 years and under', info: 'Come support your favorite youth teams!' }
  }

  const [selectedGame, setSelectedGame] = useState('')
  const [quantities, setQuantities] = useState({ adult: 0, child: 0 })
  const [cart, setCart] = useState({})
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const increaseQuantity = (type) => {
    setQuantities(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  const decreaseQuantity = (type) => {
    setQuantities(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const addToCart = (type) => {
    if (!selectedGame) {
      showNotification('Please select a game first', 'error')
      return
    }

    const quantity = quantities[type]
    if (quantity === 0) {
      showNotification('Please select a quantity', 'error')
      return
    }

    setCart(prev => {
      const newCart = { ...prev }
      
      if (!newCart[selectedGame]) {
        newCart[selectedGame] = {
          gameName: games[selectedGame],
          tickets: {}
        }
      }

      if (newCart[selectedGame].tickets[type]) {
        newCart[selectedGame].tickets[type].quantity += quantity
      } else {
        newCart[selectedGame].tickets[type] = {
          name: ticketTypes[type].name,
          price: ticketTypes[type].price,
          quantity: quantity
        }
      }

      return newCart
    })

    showNotification(`${quantity} ${ticketTypes[type].name}(s) added to cart!`)
    setQuantities(prev => ({ ...prev, [type]: 0 }))
  }

  const calculateTotal = () => {
    let total = 0
    Object.values(cart).forEach(gameData => {
      Object.values(gameData.tickets).forEach(ticket => {
        total += ticket.price * ticket.quantity
      })
    })
    return total
  }

  const checkout = () => {
    let orderSummary = 'Order Summary:\n\n'
    let total = 0

    Object.values(cart).forEach(gameData => {
      orderSummary += `${gameData.gameName}\n`
      Object.values(gameData.tickets).forEach(ticket => {
        const itemTotal = ticket.price * ticket.quantity
        total += itemTotal
        orderSummary += `  ${ticket.quantity}× ${ticket.name} - $${itemTotal}\n`
      })
      orderSummary += '\n'
    })

    orderSummary += `Total: $${total}\n\nIn a real implementation, this would redirect to a payment page.`
    alert(orderSummary)
  }

  const cartIsEmpty = Object.keys(cart).length === 0
  const total = calculateTotal()

  return (
    <main className="container-xl py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-ybt mb-2">🏀 Buy Game Tickets</h1>
        <p className="lead text-secondary">Select a game and choose your tickets</p>
      </div>

      <section className="mb-5">
        <div className="ybt-card rounded-2xl p-4">
          <h2 className="h5 fw-bold text-ybt mb-3">Select a Game</h2>
          <select 
            className="form-select form-select-lg" 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="">-- Choose a game --</option>
            {Object.entries(games).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </section>

      {selectedGame && (
        <section className="mb-5">
          <h2 className="h4 fw-bold text-ybt mb-4">Choose Your Tickets</h2>
          <div className="row g-4 mb-5">
            {Object.entries(ticketTypes).map(([type, info]) => (
              <div key={type} className="col-md-6">
                <div className="ybt-card rounded-2xl p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="h5 fw-bold text-ybt mb-1">{info.emoji} {info.name}</h3>
                      <p className="text-secondary mb-0 small">{info.desc}</p>
                    </div>
                    <div className="text-end">
                      <div className="h3 fw-bold mb-0">${info.price}</div>
                      <small className="text-secondary">per ticket</small>
                    </div>
                  </div>
                  <p className="text-secondary mb-4">{info.info}</p>
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                    <button 
                      className="quantity-btn" 
                      onClick={() => decreaseQuantity(type)}
                      disabled={quantities[type] === 0}
                    >
                      −
                    </button>
                    <div className="fs-4 fw-bold" style={{ minWidth: 40, textAlign: 'center' }}>
                      {quantities[type]}
                    </div>
                    <button 
                      className="quantity-btn" 
                      onClick={() => increaseQuantity(type)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="btn btn-ybt w-100 py-2" 
                    onClick={() => addToCart(type)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="ybt-card rounded-2xl p-4">
          <h2 className="h5 fw-bold text-ybt mb-4">Shopping Cart</h2>
          <div>
            {cartIsEmpty ? (
              <div className="text-center text-secondary py-5">Your cart is empty</div>
            ) : (
              <>
                <div>
                  {Object.entries(cart).map(([gameId, gameData]) => (
                    <div key={gameId} className="cart-item pb-3 mb-3">
                      <div className="fw-bold text-ybt mb-2">{gameData.gameName}</div>
                      {Object.entries(gameData.tickets).map(([type, ticket]) => {
                        const itemTotal = ticket.price * ticket.quantity
                        return (
                          <div key={type} className="d-flex justify-content-between text-secondary small mb-1">
                            <span>{ticket.quantity}× {ticket.name}</span>
                            <span className="fw-bold">${itemTotal}</span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div className="border-top ybt-border pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 fw-bold mb-0">Total:</span>
                    <span className="h4 fw-bold text-ybt mb-0">${total}</span>
                  </div>
                  <button 
                    className="btn btn-ybt w-100 py-3" 
                    onClick={checkout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {notification.show && (
        <div 
          className="notification show" 
          style={{ 
            position: 'fixed',
            top: 20,
            right: 20,
            background: notification.type === 'error' ? '#dc3545' : '#22c55e',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,.5)',
            zIndex: 1100
          }}
        >
          {notification.message}
        </div>
      )}
    </main>
  )
}