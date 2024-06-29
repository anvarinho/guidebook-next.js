'use client'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; 
import styles from './page.module.css'
import Image from "next/image";
import React, { useState, useEffect } from "react";
import ContactButton from '../[lang]/Components/ContactButton'

export default function Home() {
    const [showNavbar, setShowNavbar] = useState(false);
    useEffect(() => {
        window.onscroll = () =>{
            if (showNavbar){
                setShowNavbar(false)
                const navbarElement = document.querySelector(`.${styles.navbar}`);
                if (navbarElement) {
                    navbarElement.classList.remove(`${styles.active}`);
                }
            }
        }
      }, [showNavbar]);
    return (
        <body className={styles.body}>
        <ContactButton lang='ru'/>

            <header id="header" className={styles.header}>
                <div className={styles.container}>
                <nav className={styles.nav}>
                    <a href="index.html" className={styles.nav__brand}>
                        <strong>&#60;&#47;&#62;</strong>Anvar Jumabaev
                    </a>
                    <div className={styles.nav__menu} id="nav-menu">
                    <ul className={styles.nav__list}>
                        <li className={styles.nav__item}>
                        <a href="#Главная" className={styles.nav__link}>Главная</a>
                        </li>
                        <li className={styles.nav__item}>
                        <a href="#Услуги" className={styles.nav__link}>Услуги</a>
                        </li>
                        <li className={styles.nav__item}>
                        <a href="#Контакты" className={styles.nav__link}>Портфолио</a>
                        </li>
                        <li className={styles.nav__item}>
                        <a href="#Контакты" className={styles.nav__link}>Контакты</a>
                        </li>
                    </ul>
                    </div>
                    {/* <div className={styles.nav__toggle}>
                    <Image src={`/menu.svg`} alt={`google-logo.png`} width="30" height="30" title="Недорого"/>
                    <i id="nav-toggle" className="ri-menu-3-line"></i>
                    </div> */}
                </nav>
                </div>
            </header>
            <main className={styles.container}>
                <section id="Главная" className={styles.hero}>
                    <div className={styles.container}>
                        <div className={styles.hero__wrapper}>
                            <div className={styles.hero__content}>
                                <h1 className={styles.hero__title}>Разработка Веб-Сайтов, <br />Мобильных Приложений</h1>
                                <p className={styles.hero__description}>Наша команда предоставляет полный комплекс профессиональных услуг в области создания и разработки цифровых продуктов. Мы специализируемся на проектировании и разработке веб-сайтов, обеспечивая их уникальность и функциональность. Наши специалисты также занимаются публикацией и продвижением веб-ресурсов, а также разработкой мобильных приложений для платформ iOS и Android. Мы нацелены на то, чтобы помочь вашему бизнесу достичь выдающихся результатов в цифровом пространстве, предлагая индивидуальные решения, которые способствуют вашему успеху и росту.</p>
                                <div className={styles.hero__info}>
                                    <div className={styles.hero__infowrapper} >
                                        {/* <FontAwesomeIcon icon={faMoneyBill} /> */}
                                        <Image src={`/money.png`} alt={`google-logo.png`} width="50" height="50" title="Недорого"/>
                                        <h2 className={styles.hero__infotitle}>Недорого</h2>
                                        <p>Мы предлагаем услуги по конкурентоспособным ценам, обеспечивая отличное качество без лишних затрат. Наши решения подойдут для любого бюджета, сохраняя при этом высокие стандарты выполнения.</p>
                                    </div>
                                    <div className={styles.hero__infowrapper}>
                                        {/* <FontAwesomeIcon icon={faStarOfLife} /> */}
                                        <Image src={`/quality.png`} alt={`google-logo.png`} width="50" height="50" title="Качественно"/>
                                        <h2 className={styles.hero__infotitle}>Качественно</h2>
                                        <p>Наши работы выполнены с высокой точностью и вниманием к деталям. Мы применяем только современные технологии и лучшие практики для обеспечения надежности и эффективности всех наших решений.</p>
                                    </div>
                                    <div className={styles.hero__infowrapper}>
                                        {/* <FontAwesomeIcon icon={faClock} /> */}
                                        <Image src={`/clock.png`} alt={`google-logo.png`} width="50" height="50" title="В срок"/>
                                        <h2 className={styles.hero__infotitle}>В срок</h2>
                                        <p>Мы гарантируем выполнение всех проектов в установленные сроки. Наша команда тщательно планирует и контролирует процесс, чтобы обеспечить своевременное завершение каждого задания.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="Услуги" className={styles.services}>
                    <div className={styles.container}>
                        <h2>Наши Услуги</h2>
                        <p>Наша команда разрабатывает инновационные, отзывчивые и высокопроизводительные веб-сайты, используя самые современные технологии и лучшие практики в индустрии. Мы фокусируемся на создании сайтов, которые обеспечивают исключительную скорость загрузки, высокий уровень безопасности и отличную масштабируемость, что позволяет вашему бизнесу расти и адаптироваться к изменяющимся условиям рынка. Кроме того, наши веб-сайты оптимизированы для поисковых систем, что упрощает их индексацию и улучшает видимость в результатах поиска, что, в свою очередь, способствует привлечению большего количества посетителей и повышению конверсий.</p>
                        <div className={styles.services__list}>
                            <div className={styles.services__item}>
                                <h3>Лэндинг или сайт-визитка</h3>
                                <p>Мы создаем одностраничные лэндинги и сайты-визитки, которые привлекают внимание посетителей и повышают конверсию благодаря современному дизайну и UX/UI оптимизации.</p>
                            </div>
                            <div className={styles.services__item}>
                                <h3>Корпоративный сайт</h3>
                                <p>Разрабатываем корпоративные сайты, которые помогают вашему бизнесу выделяться и предоставляют все необходимые инструменты для взаимодействия с клиентами и партнёрами.</p>
                            </div>
                            <div className={styles.services__item}>
                                <h3>Интернет-магазин</h3>
                                <p>Создаём интернет-магазины с удобной системой управления, безопасными платёжными системами и оптимизированной структурой для максимального удобства ваших клиентов.</p>
                            </div>
                            <div className={styles.services__item}>
                                <h3>iOS приложения</h3>
                                <p>Мы предлагаем услуги по разработке iOS приложений, обеспечивая высокое качество и производительность на всех этапах: дизайн, разработка и развёртывание.</p>
                            </div>
                            <div className={styles.services__item}>
                                <h3>Android приложения</h3>
                                <p>Мы создаём Android приложения с акцентом на производительность, безопасность и удобство использования, включая полный цикл: дизайн, разработка и развёртывание.</p>
                            </div>
                            <div className={styles.services__item}>
                                <h3>Работа с базами данных</h3>
                                <p>Предлагаем услуги по проектированию, разработке и оптимизации баз данных, чтобы обеспечить надёжное хранение данных и их эффективное использование в ваших приложениях и системах.</p>
                            </div>
                        </div>
                    </div>
                    
                </section>
            </main>
            <footer id="Контакты" className={styles.footer}>
                <div className={styles.footer_list}>
                    <div className={styles.footer_item}>
                        <h4>Портфолио</h4>
                        <a href="https://anvarinho.github.io">anvarinho.github.io</a>
                    </div>
                    <div className={styles.footer_item}>
                        <h4>Написать</h4>
                        <a href="mailto:anvarinho@gmail.com">anvarinho@gmail.com</a>
                    </div>
                    <div className={styles.footer_item}>
                        <h4>Позвонить</h4>
                        <a href="tel:+996500490806">+996 (500) 49-08-06</a>
                    </div>
                    <div className={styles.footer_item}>
                        <h4>WhatsApp</h4>
                        <a href="https://wa.me/996500490806">+996 (500) 49-08-06</a>
                    </div>
                </div>
                <p>&copy; 2024 Anvar Jumabaev</p>
            </footer>
        </body>
    )
}