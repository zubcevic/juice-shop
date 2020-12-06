/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai')
const expect = chai.expect

describe('webhook', () => {
  const webhook = require('../../lib/webhook')

  const challenge = {
    key: 'key',
    name: 'name'
  }

  describe('notify', () => {
    it('fails when no webhook URL is provided via environment variable', () => {
      expect(() => webhook.notify(challenge)).to.throw('options.uri is a required argument')
    })

    it('fails when supplied webhook is not a valid URL', () => {
      expect(() => webhook.notify(challenge, 'localhorst')).to.throw('Invalid URI "localhorst"')
    })

    it('submits POST with payload to existing URL', () => {
      expect(() => webhook.notify(challenge, 'https://enmmrmqnft1o.x.pipedream.net')).to.not.throw()
    })
  })
})
