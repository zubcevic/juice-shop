/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ChatbotService } from '../Services/chatbot.service'
import { UserService } from '../Services/user.service'
import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faBomb } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService } from '@ngx-translate/core'
import { CookieService } from 'ngx-cookie-service'

library.add(faBomb)
dom.watch()

enum MessageSources {
  user = 'user',
  bot = 'bot'
}

interface ChatMessage {
  author: MessageSources.user | MessageSources.bot
  body: string
}

interface MessageActions {
  response: string,
  namequery: string,
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {

  public messageControl: FormControl = new FormControl()
  public messages: ChatMessage[] = []
  public juicyImageSrc: string = 'assets/public/images/ChatbotAvatar.png'
  public profileImageSrc: string = 'assets/public/images/uploads/default.svg'
  public messageActions: MessageActions = {
    response: 'query',
    namequery: 'setname'
  }
  public currentAction: string = this.messageActions.response

  constructor (private userService: UserService, private chatbotService: ChatbotService, private cookieService: CookieService, private formSubmitService: FormSubmitService, private translate: TranslateService) { }

  ngOnInit () {
    this.chatbotService.getChatbotStatus().subscribe((response) => {
      this.messages.push({
        author: MessageSources.bot,
        body: response.body
      })
      if (response.action) {
        this.currentAction = this.messageActions[response.action]
      }
    })

    this.userService.whoAmI().subscribe((user: any) => {
      this.profileImageSrc = user.profileImage
    }, (err) => {
      console.log(err)
    })
  }

  handleResponse (response) {
    this.messages.push({
      author: MessageSources.bot,
      body: response.body
    })
    this.currentAction = this.messageActions[response.action]
    if (response.token) {
      localStorage.setItem('token', response.token)
      let expires = new Date()
      expires.setHours(expires.getHours() + 8)
      this.cookieService.set('token', response.token, expires, '/')
    }
  }

  sendMessage () {
    let messageBody = this.messageControl.value
    if (messageBody) {
      this.messages.push({
        author: MessageSources.user,
        body: messageBody
      })
      this.messageControl.setValue('')
      this.chatbotService.getChatbotStatus().subscribe((response) => {
        if (!response.status && !response.action) {
          this.messages.push({
            author: MessageSources.bot,
            body: response.body
          })
        } else {
          this.chatbotService.getResponse(this.currentAction, messageBody).subscribe((response) => {
            this.handleResponse(response)
          })
        }
        const chat = document.getElementById('chat-window')
        chat.scrollTop = chat.scrollHeight
      })
    }
  }

}
