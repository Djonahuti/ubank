import HeaderBox from "@/components/HeaderBox"
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react"

const Home = () => {
  const loggedIn = { firstName: 'David', lastName: 'Jonah', email: 'davidutjonah@ushop.com.ng'};

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and Manage your account and transactions efficiently."
          />
          <TotalBalanceBox 
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1250.35}
          />
        </header>

        RECENT TRANSACTIONS
      </div>

      <RightSidebar
       user={loggedIn}
       transactions={[]}
       banks={[{currentBalance: 123.50}, { currentBalance: 500.23}]} 
      />
    </section>
  )
}

export default Home